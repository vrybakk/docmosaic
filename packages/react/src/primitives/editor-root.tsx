'use client';

import {
    createPage,
    createSection,
    estimatePDFSize,
    type Document,
    type ImageSection,
    type PageOrientation,
    type PageSize,
} from '@docmosaic/core';
import { Children, isValidElement, type ReactNode, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditorConfigProvider, defaultImageRenderer } from '../context/editor-config';
import {
    EditorProvider,
    useEditorUiState,
    type EditorActions,
    type EditorContextValue,
} from '../context/editor';
import { useDocumentState } from '../hooks/use-document-state';
import { trackEvent } from '../internal/analytics';
import { Canvas } from './canvas';
import { Header } from './header';
import { PageList } from './page-list';
import { Toolbar } from './toolbar';
import { usePdfGeneration } from './use-pdf-generation';

/**
 * Props for `Editor.Root`.
 *
 * `Editor.Root` supports both controlled and uncontrolled state:
 *
 * - **Uncontrolled** (default): omit `document`. The root owns the document
 *   internally via `useDocumentState` (reducer + history). Pass
 *   `defaultDocument` to seed; otherwise a fresh document is created.
 * - **Controlled**: pass `document` and `onDocumentChange`. The root never
 *   owns state; every mutation calls `onDocumentChange(next)` and the parent
 *   re-renders with the new value. Undo/redo are disabled in controlled mode
 *   because the timeline lives outside the editor.
 *
 * @remarks
 * Mixing controlled and uncontrolled in the same render is unsupported and
 * will warn in development.
 */
export type EditorRootProps = {
    children: ReactNode;
} & (
    | {
          /** Controlled: caller owns the document. */
          document: Document;
          onDocumentChange: (next: Document) => void;
          defaultDocument?: never;
      }
    | {
          document?: never;
          onDocumentChange?: never;
          /** Uncontrolled: optional seed for the internally-owned document. */
          defaultDocument?: Document;
      }
);

function useFormattedDate(updatedAt: Date) {
    const [formatted, setFormatted] = useState('');
    useEffect(() => {
        setFormatted(
            updatedAt.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        );
    }, [updatedAt]);
    return formatted;
}

/**
 * Build an {@link EditorActions} surface for **controlled** mode. Every action
 * computes the next document and forwards it to `onDocumentChange`. There is
 * no internal history, so undo/redo are no-ops.
 */
function buildControlledActions(
    document: Document,
    onDocumentChange: (next: Document) => void,
): EditorActions {
    const touch = (next: Document): Document => ({ ...next, updatedAt: new Date() });

    return {
        undo: () => {},
        redo: () => {},
        addSection: () => {
            const newSection = createSection(5, 5, document.currentPage);
            onDocumentChange(touch({ ...document, sections: [...document.sections, newSection] }));
            return newSection;
        },
        updateSection: (section: ImageSection) =>
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) => (s.id === section.id ? section : s)),
                }),
            ),
        deleteSection: (sectionId: string) =>
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.filter((s) => s.id !== sectionId),
                }),
            ),
        duplicateSection: (section: ImageSection) => {
            const clone = createSection(0, 0, section.page);
            const duplicated: ImageSection = {
                ...section,
                id: clone.id,
                x: section.x + 20,
                y: section.y + 20,
            };
            onDocumentChange(
                touch({ ...document, sections: [...document.sections, duplicated] }),
            );
        },
        addPage: () => {
            const newTotal = (document.totalPages ?? document.pages.length) + 1;
            onDocumentChange(
                touch({
                    ...document,
                    pages: [...document.pages, createPage()],
                    totalPages: newTotal,
                    currentPage: newTotal,
                }),
            );
        },
        deletePage: (pageIndex: number) => {
            if (document.pages.length <= 1) {
                alert('Cannot delete the last page');
                return;
            }
            const newPages = document.pages.filter((_, i) => i !== pageIndex);
            const adjustedSections = document.sections
                .filter((s) => s.page !== pageIndex + 1)
                .map((s) => (s.page > pageIndex + 1 ? { ...s, page: s.page - 1 } : s));
            onDocumentChange(
                touch({
                    ...document,
                    pages: newPages,
                    sections: adjustedSections,
                    totalPages: (document.totalPages ?? document.pages.length) - 1,
                    currentPage: Math.min(
                        document.currentPage,
                        (document.totalPages ?? document.pages.length) - 1,
                    ),
                }),
            );
        },
        changePage: (pageNumber: number) =>
            onDocumentChange(touch({ ...document, currentPage: pageNumber })),
        updatePageSize: (pageSize: PageSize) =>
            onDocumentChange(touch({ ...document, pageSize })),
        updateOrientation: (orientation: PageOrientation) =>
            onDocumentChange(touch({ ...document, orientation })),
        updateName: (name: string) => onDocumentChange(touch({ ...document, name })),
        reorderPages: (fromIndex: number, toIndex: number) => {
            const newPages = [...document.pages];
            const [moved] = newPages.splice(fromIndex, 1);
            newPages.splice(toIndex, 0, moved);
            const updatedSections = document.sections.map((s) => {
                if (s.page === fromIndex + 1) return { ...s, page: toIndex + 1 };
                if (fromIndex < toIndex && s.page > fromIndex + 1 && s.page <= toIndex + 1) {
                    return { ...s, page: s.page - 1 };
                }
                if (fromIndex > toIndex && s.page >= toIndex + 1 && s.page < fromIndex + 1) {
                    return { ...s, page: s.page + 1 };
                }
                return s;
            });
            onDocumentChange(touch({ ...document, pages: newPages, sections: updatedSections }));
        },
        updateEstimatedSize: (size: number) =>
            onDocumentChange(touch({ ...document, estimatedSize: size })),
    };
}

/**
 * Internal: build the editor context value when running in controlled mode.
 */
function ControlledRoot({
    document,
    onDocumentChange,
    children,
}: {
    document: Document;
    onDocumentChange: (next: Document) => void;
    children: ReactNode;
}) {
    const formattedDate = useFormattedDate(document.updatedAt);
    const ui = useEditorUiState(formattedDate);

    const actions = useMemo(
        () => buildControlledActions(document, onDocumentChange),
        [document, onDocumentChange],
    );

    const wrappedActions = useMemo<EditorActions>(
        () => ({
            ...actions,
            addSection: () => {
                trackEvent.addSection();
                const section = actions.addSection();
                ui.setSelectedSectionId(section.id);
                return section;
            },
            updateName: (name: string) => {
                trackEvent.rename(document.name, name);
                actions.updateName(name);
            },
            updatePageSize: (pageSize: PageSize) => {
                trackEvent.pageSize(pageSize);
                actions.updatePageSize(pageSize);
            },
            updateOrientation: (orientation: PageOrientation) => {
                trackEvent.orientation(orientation);
                actions.updateOrientation(orientation);
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [actions, document.name],
    );

    const pdfApi = usePdfGeneration({
        document,
        onSizeKnown: (size) => actions.updateEstimatedSize(size),
    });

    useEffect(() => {
        const backgrounds = document.pages.map((p) => p.backgroundPDF);
        ui.setEstimatedSize(estimatePDFSize(document.sections, backgrounds));
    }, [document.sections, document.pages, ui]);

    const value: EditorContextValue = {
        state: document,
        canUndo: false,
        canRedo: false,
        actions: wrappedActions,
        pdfApi,
        ui,
    };

    return <EditorProvider value={value}>{children}</EditorProvider>;
}

/**
 * Internal: build the editor context value when running in uncontrolled mode.
 *
 * Owns state via {@link useDocumentState} (reducer + history). Wraps the raw
 * actions with analytics + selection side-effects to match the legacy editor.
 */
function UncontrolledRoot({
    defaultDocument,
    children,
}: {
    defaultDocument?: Document;
    children: ReactNode;
}) {
    const { document, formattedDate, canUndo, canRedo, actions } = useDocumentState({
        initialDocument: defaultDocument,
    });

    const ui = useEditorUiState(formattedDate);

    const pdfApi = usePdfGeneration({
        document,
        onSizeKnown: (size) => actions.updateEstimatedSize(size),
    });

    useEffect(() => {
        trackEvent.editorInit();
    }, []);

    useEffect(() => {
        const backgrounds = document.pages.map((p) => p.backgroundPDF);
        ui.setEstimatedSize(estimatePDFSize(document.sections, backgrounds));
    }, [document.sections, document.pages, ui]);

    const wrappedActions = useMemo<EditorActions>(
        () => ({
            ...actions,
            undo: () => {
                trackEvent.undo();
                actions.undo();
            },
            redo: () => {
                trackEvent.redo();
                actions.redo();
            },
            addSection: () => {
                trackEvent.addSection();
                const section = actions.addSection();
                ui.setSelectedSectionId(section.id);
                return section;
            },
            updateName: (name: string) => {
                trackEvent.rename(document.name, name);
                actions.updateName(name);
            },
            updatePageSize: (pageSize: PageSize) => {
                trackEvent.pageSize(pageSize);
                actions.updatePageSize(pageSize);
            },
            updateOrientation: (orientation: PageOrientation) => {
                trackEvent.orientation(orientation);
                actions.updateOrientation(orientation);
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [actions, document.name],
    );

    const value: EditorContextValue = {
        state: document,
        canUndo,
        canRedo,
        actions: wrappedActions,
        pdfApi,
        ui,
    };

    return <EditorProvider value={value}>{children}</EditorProvider>;
}

/**
 * Arrange children into the editor's default shell:
 *
 * 1. `Editor.Header` (or any non-workspace, non-preview child up top)
 * 2. `Editor.Toolbar`
 * 3. Flex-row workspace containing `Editor.PageList` + `Editor.Canvas` —
 *    regardless of the source order, the sidebar is forced to the left.
 * 4. Any remaining children (e.g. `Editor.Preview`)
 *
 * This lets consumers write the flat composition the docs advertise
 * without re-introducing the rigid slot props from the previous root.
 */
function arrangeChildren(children: ReactNode): ReactNode {
    const top: ReactNode[] = [];
    let toolbar: ReactNode | null = null;
    let pageList: ReactNode | null = null;
    let canvas: ReactNode | null = null;
    const trailing: ReactNode[] = [];

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
            trailing.push(child);
            return;
        }
        if (child.type === Header) {
            top.push(child);
            return;
        }
        if (child.type === Toolbar) {
            toolbar = child;
            return;
        }
        if (child.type === PageList) {
            pageList = child;
            return;
        }
        if (child.type === Canvas) {
            canvas = child;
            return;
        }
        trailing.push(child);
    });

    return (
        <>
            {top}
            {toolbar}
            {(pageList || canvas) && (
                <div className="flex-1 flex min-h-0">
                    {pageList}
                    {canvas}
                </div>
            )}
            {trailing}
        </>
    );
}

/**
 * Editor root — orchestrator + default shell.
 *
 * Wraps children in the DnD provider, the editor config (image renderer)
 * provider, and the editor state context. Children are arranged into a
 * flex column with the page-list/canvas placed side-by-side inside a
 * shared workspace row so the flat compound composition advertised in the
 * docs works out of the box.
 *
 * @example Uncontrolled (default)
 * ```tsx
 * <Editor.Root>
 *   <Editor.Header />
 *   <Editor.Toolbar />
 *   <Editor.PageList />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [doc, setDoc] = useState(createDocument());
 * <Editor.Root document={doc} onDocumentChange={setDoc}>
 *   ...
 * </Editor.Root>
 * ```
 */
export function Root(props: EditorRootProps) {
    const isControlled = props.document !== undefined;
    const layout = (
        <div className="flex flex-col h-screen bg-gray-50">
            {arrangeChildren(props.children)}
        </div>
    );

    return (
        <EditorConfigProvider value={{ imageRenderer: defaultImageRenderer }}>
            <DndProvider backend={HTML5Backend}>
                {isControlled ? (
                    <ControlledRoot
                        document={props.document!}
                        onDocumentChange={props.onDocumentChange!}
                    >
                        {layout}
                    </ControlledRoot>
                ) : (
                    <UncontrolledRoot defaultDocument={props.defaultDocument}>
                        {layout}
                    </UncontrolledRoot>
                )}
            </DndProvider>
        </EditorConfigProvider>
    );
}

