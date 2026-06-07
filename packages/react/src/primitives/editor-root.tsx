'use client';

import {
    createPage,
    createSection,
    estimatePDFSize as defaultEstimatePDFSize,
    generatePDF as defaultGeneratePDF,
    generatePNGs as defaultGeneratePNGs,
    type Document,
    type PageBackground,
    type PageOrientation,
    type PageSize,
    type Section,
    type Stroke,
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
    type EditorPdfBackend,
} from '../context/editor';
import { useDocumentState } from '../hooks/use-document-state';
import {
    useEditorKeybindings,
    type EditorKeymap,
} from '../hooks/use-editor-keybindings';
import { trackEvent } from '../internal/analytics';
import { Canvas } from './canvas';
import { Inspector } from './inspector';
import { Pages } from './pages';
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
    /**
     * Pluggable PDF backend.
     *
     * Either or both functions can be overridden. Anything omitted falls back
     * to the bundled `@docmosaic/core` implementation (`generatePDF` /
     * `estimatePDFSize`).
     *
     * Use this to swap the jsPDF path for a different renderer, run generation
     * in a Worker, or mock it out in tests.
     *
     * @example
     * ```tsx
     * import type { generatePDF, estimatePDFSize } from '@docmosaic/core';
     *
     * const generate: typeof generatePDF = async (sections, options, onProgress) => {
     *   // Custom pipeline — e.g. delegate to a Worker or use pdf-lib.
     *   return await myCustomRenderer(sections, options, onProgress);
     * };
     *
     * const estimate: typeof estimatePDFSize = (sections, backgrounds) => {
     *   // Faster heuristic that matches the custom renderer's output.
     *   return mySizeHeuristic(sections, backgrounds);
     * };
     *
     * <Editor.Root pdf={{ generate, estimate }}>...</Editor.Root>
     * ```
     */
    pdf?: Partial<EditorPdfBackend>;
    /**
     * Keyboard shortcuts.
     *
     * - Omit (default): the built-in keymap is active — `mod+z` undo,
     *   `mod+shift+z` / `mod+y` redo, `Delete` / `Backspace` removes the
     *   selected section, `Escape` deselects, and `Arrow` / `Shift+Arrow`
     *   nudge the selected section by 1pt / 10pt.
     * - Pass a partial {@link EditorKeymap} to override individual bindings or
     *   register alternates (e.g. `{ redo: 'mod+r' }`).
     * - Pass `false` to disable the layer entirely — no window listener is
     *   attached.
     *
     * Bindings are skipped while focus is inside an `<input>`, `<textarea>`,
     * `<select>`, or anything `contenteditable`, so text fields like the
     * document-name input remain typeable.
     *
     * @example Override redo
     * ```tsx
     * <Editor.Root keybindings={{ redo: 'mod+r' }}>...</Editor.Root>
     * ```
     *
     * @example Disable all shortcuts
     * ```tsx
     * <Editor.Root keybindings={false}>...</Editor.Root>
     * ```
     */
    keybindings?: Partial<EditorKeymap> | false;
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

/**
 * Internal component that calls {@link useEditorKeybindings} from inside the
 * editor context. Rendering it conditionally lets `Editor.Root` skip attaching
 * the window listener entirely when `keybindings={false}`.
 */
function KeybindingsListener({ keymap }: { keymap: Partial<EditorKeymap> }) {
    useEditorKeybindings(keymap);
    return null;
}

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
        addSection: (opts?: {
            type?: 'image' | 'text' | 'shape' | 'drawing';
            shape?: 'rect' | 'circle' | 'line';
        }) => {
            const newSection = createSection({
                type: opts?.type ?? 'image',
                shape: opts?.shape,
                x: 5,
                y: 5,
                page: document.currentPage,
            });
            onDocumentChange(touch({ ...document, sections: [...document.sections, newSection] }));
            return newSection;
        },
        addStroke: (sectionId: string, stroke: Stroke) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target || target.type !== 'drawing') return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId && s.type === 'drawing'
                            ? { ...s, strokes: [...s.strokes, stroke] }
                            : s,
                    ),
                }),
            );
        },
        clearStrokes: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target || target.type !== 'drawing') return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId && s.type === 'drawing' ? { ...s, strokes: [] } : s,
                    ),
                }),
            );
        },
        updateSection: (section: Section) =>
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
        duplicateSection: (section: Section) => {
            const clone = createSection({ x: 0, y: 0, page: section.page });
            const duplicated: Section = {
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
        setPageBackground: (pageIndex: number, background: PageBackground | undefined) => {
            if (pageIndex < 0 || pageIndex >= document.pages.length) return;
            onDocumentChange(
                touch({
                    ...document,
                    pages: document.pages.map((p, i) =>
                        i === pageIndex ? { ...p, background } : p,
                    ),
                }),
            );
        },
        bringToFront: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            const peers = document.sections.filter((s) => s.page === target.page);
            const maxZ = peers.reduce((m, s) => (s.zIndex > m ? s.zIndex : m), -Infinity);
            if (target.zIndex === maxZ && peers.length === 1) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, zIndex: maxZ + 1 } : s,
                    ),
                }),
            );
        },
        sendToBack: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            const peers = document.sections.filter((s) => s.page === target.page);
            const minZ = peers.reduce((m, s) => (s.zIndex < m ? s.zIndex : m), Infinity);
            if (target.zIndex === minZ && peers.length === 1) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, zIndex: minZ - 1 } : s,
                    ),
                }),
            );
        },
        moveForward: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            const higher = document.sections.filter(
                (s) => s.page === target.page && s.id !== target.id && s.zIndex > target.zIndex,
            );
            if (higher.length === 0) return;
            const next = higher.reduce((best, s) => (s.zIndex < best.zIndex ? s : best));
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) => {
                        if (s.id === target.id) return { ...s, zIndex: next.zIndex };
                        if (s.id === next.id) return { ...s, zIndex: target.zIndex };
                        return s;
                    }),
                }),
            );
        },
        moveBackward: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            const lower = document.sections.filter(
                (s) => s.page === target.page && s.id !== target.id && s.zIndex < target.zIndex,
            );
            if (lower.length === 0) return;
            const next = lower.reduce((best, s) => (s.zIndex > best.zIndex ? s : best));
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) => {
                        if (s.id === target.id) return { ...s, zIndex: next.zIndex };
                        if (s.id === next.id) return { ...s, zIndex: target.zIndex };
                        return s;
                    }),
                }),
            );
        },
        loadDocument: (next: Document) => onDocumentChange(touch(next)),
    };
}

/**
 * Internal: build the editor context value when running in controlled mode.
 */
function ControlledRoot({
    document,
    onDocumentChange,
    pdfBackend,
    children,
}: {
    document: Document;
    onDocumentChange: (next: Document) => void;
    pdfBackend: EditorPdfBackend;
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
            addSection: (opts?: {
                type?: 'image' | 'text' | 'shape' | 'drawing';
                shape?: 'rect' | 'circle' | 'line';
            }) => {
                trackEvent.addSection();
                const section = actions.addSection(opts);
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
        backend: pdfBackend,
    });

    useEffect(() => {
        const backgrounds = document.pages.map((p) => p.backgroundPDF);
        ui.setEstimatedSize(pdfBackend.estimate(document.sections, backgrounds));
    }, [document.sections, document.pages, ui, pdfBackend]);

    const value: EditorContextValue = {
        state: document,
        canUndo: false,
        canRedo: false,
        actions: wrappedActions,
        pdfApi,
        pdfBackend,
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
    pdfBackend,
    children,
}: {
    defaultDocument?: Document;
    pdfBackend: EditorPdfBackend;
    children: ReactNode;
}) {
    const { document, formattedDate, canUndo, canRedo, actions } = useDocumentState({
        initialDocument: defaultDocument,
    });

    const ui = useEditorUiState(formattedDate);

    const pdfApi = usePdfGeneration({
        document,
        onSizeKnown: (size) => actions.updateEstimatedSize(size),
        backend: pdfBackend,
    });

    useEffect(() => {
        trackEvent.editorInit();
    }, []);

    useEffect(() => {
        const backgrounds = document.pages.map((p) => p.backgroundPDF);
        ui.setEstimatedSize(pdfBackend.estimate(document.sections, backgrounds));
    }, [document.sections, document.pages, ui, pdfBackend]);

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
            addSection: (opts?: {
                type?: 'image' | 'text' | 'shape' | 'drawing';
                shape?: 'rect' | 'circle' | 'line';
            }) => {
                trackEvent.addSection();
                const section = actions.addSection(opts);
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
        pdfBackend,
        ui,
    };

    return <EditorProvider value={value}>{children}</EditorProvider>;
}

/**
 * Arrange children into the editor's default shell:
 *
 * 1. `Editor.Inspector` (or any non-workspace, non-preview child up top)
 * 2. `Editor.Toolbar`
 * 3. Flex-row workspace containing `Editor.Pages` + `Editor.Canvas` —
 *    regardless of the source order, the sidebar is forced to the left.
 * 4. Any remaining children (e.g. `Editor.Preview`)
 *
 * This lets consumers write the flat composition the docs advertise
 * without re-introducing the rigid slot props from the previous root.
 */
function arrangeChildren(children: ReactNode): ReactNode {
    const top: ReactNode[] = [];
    let toolbar: ReactNode | null = null;
    let pages: ReactNode | null = null;
    let canvas: ReactNode | null = null;
    const trailing: ReactNode[] = [];

    Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
            trailing.push(child);
            return;
        }
        if (child.type === Inspector) {
            top.push(child);
            return;
        }
        if (child.type === Toolbar) {
            toolbar = child;
            return;
        }
        if (child.type === Pages) {
            pages = child;
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
            {(pages || canvas) && (
                <div className="flex-1 flex min-h-0">
                    {pages}
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
 *   <Editor.Inspector />
 *   <Editor.Toolbar />
 *   <Editor.Pages />
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
 *
 * @example Override or disable keyboard shortcuts
 * ```tsx
 * // Add a custom redo binding alongside the defaults.
 * <Editor.Root keybindings={{ redo: 'mod+r' }}>...</Editor.Root>
 *
 * // Or turn the layer off entirely.
 * <Editor.Root keybindings={false}>...</Editor.Root>
 * ```
 */
export function Root(props: EditorRootProps) {
    const isControlled = props.document !== undefined;
    const pdfBackend = useMemo<EditorPdfBackend>(
        () => ({
            generate: props.pdf?.generate ?? defaultGeneratePDF,
            estimate: props.pdf?.estimate ?? defaultEstimatePDFSize,
            generatePNGs: props.pdf?.generatePNGs ?? defaultGeneratePNGs,
        }),
        [props.pdf?.generate, props.pdf?.estimate, props.pdf?.generatePNGs],
    );

    const keybindingsEnabled = props.keybindings !== false;
    const keymap: Partial<EditorKeymap> = props.keybindings ? props.keybindings : {};

    const layout = (
        <div className="flex flex-col h-screen bg-gray-50">
            {keybindingsEnabled && <KeybindingsListener keymap={keymap} />}
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
                        pdfBackend={pdfBackend}
                    >
                        {layout}
                    </ControlledRoot>
                ) : (
                    <UncontrolledRoot
                        defaultDocument={props.defaultDocument}
                        pdfBackend={pdfBackend}
                    >
                        {layout}
                    </UncontrolledRoot>
                )}
            </DndProvider>
        </EditorConfigProvider>
    );
}

