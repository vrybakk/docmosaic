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
import { Children, type ReactNode, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { EditorConfigProvider, defaultImageRenderer } from '../context/editor-config';
import {
    EditorProvider,
    useEditorUiState,
    type AddSectionOptions,
    type EditorActions,
    type EditorContextValue,
    type EditorPdfBackend,
} from '../context/editor';
import { useDocumentState } from '../hooks/use-document-state';
import { useEditorKeybindings, type EditorKeymap } from '../hooks/use-editor-keybindings';
import { trackEvent } from '../internal/analytics';
import { EditorShell } from './app-shell';
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
    /**
     * Extra nodes mounted **after** the default app-shell — custom dialogs,
     * an extra toaster, analytics bridges, etc. The shell renders the full
     * editor on its own, so children are purely additive overlays. Omit for
     * the canonical `<Editor.Root />` usage.
     */
    children?: ReactNode;
    /**
     * Theme-toggle slot rendered in the top-bar right group. The package never
     * imports `next-themes`; the host app injects a ready-made toggle node
     * here. Renders nothing when omitted.
     */
    themeToggle?: ReactNode;
    /**
     * Slot rendered at the far-left of the top bar (desktop and mobile), before
     * the document name. The package stays route-agnostic; the host injects a
     * ready-made node here — e.g. a "back to site" link. Renders nothing when
     * omitted.
     */
    leadingSlot?: ReactNode;
    /** Render the left rail (tool palette + Pages + Layers). Defaults to `true`. */
    showLeftRail?: boolean;
    /** Render the tool palette inside the left rail. Defaults to `true`. */
    showToolPalette?: boolean;
    /** Render the "Pages" section inside the left rail. Defaults to `true`. */
    showPages?: boolean;
    /** Render the "Layers" section inside the left rail. Defaults to `true`. */
    showLayers?: boolean;
    /** Render the right inspector panel. Defaults to `true`. */
    showInspector?: boolean;
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
    /**
     * Render the editor in read-only / viewer mode. Defaults to `false`.
     *
     * When `true`:
     * - Section drag, resize, drop, and file upload are suppressed.
     * - Section floating toolbars (delete, duplicate, layer buttons) hide.
     * - The properties bar (document name, page size, orientation) becomes
     *   read-only.
     * - The page list hides Add Image / Add Page / per-page delete and
     *   ignores reorder gestures.
     * - The `PropertiesPanel` renders its number/text inputs disabled and
     *   hides the Layer buttons.
     * - The toolbar's `AddImageButton`, `AddTextButton`, `AddShapeButton`,
     *   `DrawButton`, `UndoButton`, and `RedoButton` hide themselves.
     * - Keybindings skip every mutating action (`undo`, `redo`,
     *   `deleteSection`, `nudge*`); `deselect` (Esc) still works.
     * - Drawing-mode pointer captures are ignored.
     *
     * What still works:
     * - Selection (click, shift-click, marquee).
     * - Zoom, pan, preview dialog, print, PDF/PNG download.
     *
     * @example
     * ```tsx
     * <Editor.Root defaultDocument={signedContract} readOnly>
     *   <Editor.Properties />
     *   <Editor.Toolbar />
     *   <Editor.Canvas />
     *   <Editor.Preview />
     * </Editor.Root>
     * ```
     */
    readOnly?: boolean;
    /**
     * Render `Editor.Ruler` along the top and left edges of the canvas
     * viewport. Defaults to `false`. When `true`, the canvas reserves a
     * 24px gutter on each axis so the rulers sit flush with the page edge
     * without occluding section geometry.
     */
    showRuler?: boolean;
    /**
     * Render `Editor.Minimap` anchored to the bottom-right of the canvas
     * viewport — a thumbnail of the current page plus a viewport rectangle
     * that pans the main canvas. Defaults to `false`.
     */
    showMinimap?: boolean;
    /**
     * Unit used by `Editor.Ruler` tick labels. Defaults to `'pt'` so the
     * tick values match the document's storage unit one-to-one. Set to
     * `'mm'` or `'in'` to surface a human-facing measurement instead.
     */
    rulerUnit?: 'pt' | 'mm' | 'in';
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
        addSection: (opts?: AddSectionOptions) => {
            const created = createSection({
                type: opts?.type ?? 'image',
                shape: opts?.shape,
                maskShape: opts?.maskShape,
                x: 5,
                y: 5,
                page: document.currentPage,
            });
            const newSection: Section = opts?.rect ? { ...created, ...opts.rect } : created;
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
                    // Deleting a container frame fans out to its children —
                    // mirrors the core reducer's DELETE_SECTION cascade.
                    sections: document.sections.filter(
                        (s) => s.id !== sectionId && s.parentFrameId !== sectionId,
                    ),
                }),
            ),
        duplicateSection: (section: Section) => {
            // Duplicating a container frame also clones its children, re-pointed
            // at the new frame — mirrors the core reducer. Read the frame's
            // geometry from the document (raw points) so the clone keeps its
            // internal layout regardless of any canvas-scaled coords on `section`.
            if (section.type === 'frame') {
                const rawFrame = document.sections.find((s) => s.id === section.id);
                if (!rawFrame) return;
                const newId = createSection({ x: 0, y: 0, page: rawFrame.page }).id;
                const duplicatedFrame: Section = {
                    ...rawFrame,
                    id: newId,
                    x: rawFrame.x + 20,
                    y: rawFrame.y + 20,
                };
                const childClones: Section[] = document.sections
                    .filter((s) => s.parentFrameId === rawFrame.id)
                    .map((child) => ({
                        ...child,
                        id: createSection({ x: 0, y: 0, page: child.page }).id,
                        x: child.x + 20,
                        y: child.y + 20,
                        parentFrameId: newId,
                    }));
                onDocumentChange(
                    touch({
                        ...document,
                        sections: [...document.sections, duplicatedFrame, ...childClones],
                    }),
                );
                return;
            }
            const clone = createSection({ x: 0, y: 0, page: section.page });
            const duplicated: Section = {
                ...section,
                id: clone.id,
                x: section.x + 20,
                y: section.y + 20,
            };
            onDocumentChange(touch({ ...document, sections: [...document.sections, duplicated] }));
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
        updatePageSize: (pageSize: PageSize) => onDocumentChange(touch({ ...document, pageSize })),
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
        toggleHidden: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, hidden: !s.hidden } : s,
                    ),
                }),
            );
        },
        toggleLocked: (sectionId: string) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, locked: !s.locked } : s,
                    ),
                }),
            );
        },
        setHidden: (sectionId: string, hidden: boolean) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, hidden } : s,
                    ),
                }),
            );
        },
        setLocked: (sectionId: string, locked: boolean) => {
            const target = document.sections.find((s) => s.id === sectionId);
            if (!target) return;
            onDocumentChange(
                touch({
                    ...document,
                    sections: document.sections.map((s) =>
                        s.id === sectionId ? { ...s, locked } : s,
                    ),
                }),
            );
        },
        loadDocument: (next: Document) => onDocumentChange(touch(next)),
        addGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) => {
            if (pageIndex < 0 || pageIndex >= document.pages.length) return;
            const page = document.pages[pageIndex];
            const existing = page.guides ?? { vertical: [], horizontal: [] };
            if (existing[axis].includes(position)) return;
            const nextGuides = {
                vertical:
                    axis === 'vertical' ? [...existing.vertical, position] : existing.vertical,
                horizontal:
                    axis === 'horizontal'
                        ? [...existing.horizontal, position]
                        : existing.horizontal,
            };
            onDocumentChange(
                touch({
                    ...document,
                    pages: document.pages.map((p, i) =>
                        i === pageIndex ? { ...p, guides: nextGuides } : p,
                    ),
                }),
            );
        },
        removeGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) => {
            if (pageIndex < 0 || pageIndex >= document.pages.length) return;
            const page = document.pages[pageIndex];
            if (!page.guides) return;
            if (!page.guides[axis].includes(position)) return;
            const nextGuides = {
                vertical:
                    axis === 'vertical'
                        ? page.guides.vertical.filter((v) => v !== position)
                        : page.guides.vertical,
                horizontal:
                    axis === 'horizontal'
                        ? page.guides.horizontal.filter((v) => v !== position)
                        : page.guides.horizontal,
            };
            onDocumentChange(
                touch({
                    ...document,
                    pages: document.pages.map((p, i) =>
                        i === pageIndex ? { ...p, guides: nextGuides } : p,
                    ),
                }),
            );
        },
    };
}

/**
 * Internal: build the editor context value when running in controlled mode.
 */
function ControlledRoot({
    document,
    onDocumentChange,
    pdfBackend,
    readOnly,
    display,
    children,
}: {
    document: Document;
    onDocumentChange: (next: Document) => void;
    pdfBackend: EditorPdfBackend;
    readOnly: boolean;
    display: EditorContextValue['display'];
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
            addSection: (opts?: AddSectionOptions) => {
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
        readOnly,
        display,
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
    readOnly,
    display,
    children,
}: {
    defaultDocument?: Document;
    pdfBackend: EditorPdfBackend;
    readOnly: boolean;
    display: EditorContextValue['display'];
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
            addSection: (opts?: AddSectionOptions) => {
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
        readOnly,
        display,
    };

    return <EditorProvider value={value}>{children}</EditorProvider>;
}

/**
 * Editor root — orchestrator + default app-shell.
 *
 * Wraps the editor in the DnD provider, the editor config (image renderer)
 * provider, and the editor state context, then renders the resizable
 * Figma/Canva-style app-shell ({@link EditorShell}): a top bar over a
 * three-panel workspace (left rail · canvas · inspector). `<Editor.Root />`
 * with no children renders the full editor out of the box.
 *
 * Any `children` are mounted **after** the shell as additive overlays — use
 * them for custom dialogs or extra toasters; the shell already renders the
 * editor itself.
 *
 * @example Default (uncontrolled) — the full editor with no composition
 * ```tsx
 * <Editor.Root showRuler showMinimap themeToggle={<ThemeToggle />} />
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [doc, setDoc] = useState(createDocument());
 * <Editor.Root document={doc} onDocumentChange={setDoc} />
 * ```
 *
 * @example Override or disable keyboard shortcuts
 * ```tsx
 * // Add a custom redo binding alongside the defaults.
 * <Editor.Root keybindings={{ redo: 'mod+r' }} />
 *
 * // Or turn the layer off entirely.
 * <Editor.Root keybindings={false} />
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
    const readOnly = props.readOnly === true;
    const display = useMemo<EditorContextValue['display']>(
        () => ({
            showRuler: props.showRuler === true,
            showMinimap: props.showMinimap === true,
            rulerUnit: props.rulerUnit ?? 'pt',
        }),
        [props.showRuler, props.showMinimap, props.rulerUnit],
    );

    // `<Editor.Root />` (no children) renders the full resizable app-shell.
    // When children are supplied, they take over composition and render in a
    // plain full-height column instead — the shell would otherwise duplicate
    // every primitive the consumer mounted. This keeps the flat compound API
    // (`<Editor.Root><Editor.Canvas/>…</Editor.Root>`) working as an escape
    // hatch on top of the zero-config default.
    const hasChildren = Children.count(props.children) > 0;

    const layout = (
        <>
            {keybindingsEnabled && <KeybindingsListener keymap={keymap} />}
            {hasChildren ? (
                <div className="flex h-screen flex-col bg-background text-foreground">
                    {props.children}
                </div>
            ) : (
                <EditorShell
                    themeToggle={props.themeToggle}
                    leadingSlot={props.leadingSlot}
                    showLeftRail={props.showLeftRail !== false}
                    showToolPalette={props.showToolPalette !== false}
                    showPages={props.showPages !== false}
                    showLayers={props.showLayers !== false}
                    showInspector={props.showInspector !== false}
                />
            )}
        </>
    );

    return (
        <EditorConfigProvider value={{ imageRenderer: defaultImageRenderer }}>
            {/* MultiBackend: HTML5 drag-and-drop on desktop, automatically
                transitioning to the touch backend on the first touch so layer
                reorder + section drops work by finger. Desktop keeps the exact
                HTML5Backend path. */}
            <DndProvider backend={MultiBackend} options={HTML5toTouch}>
                {isControlled ? (
                    <ControlledRoot
                        document={props.document!}
                        onDocumentChange={props.onDocumentChange!}
                        pdfBackend={pdfBackend}
                        readOnly={readOnly}
                        display={display}
                    >
                        {layout}
                    </ControlledRoot>
                ) : (
                    <UncontrolledRoot
                        defaultDocument={props.defaultDocument}
                        pdfBackend={pdfBackend}
                        readOnly={readOnly}
                        display={display}
                    >
                        {layout}
                    </UncontrolledRoot>
                )}
            </DndProvider>
        </EditorConfigProvider>
    );
}
