'use client';

/**
 * @packageDocumentation
 *
 * Editor context — the runtime view of the document plus the action surface
 * exposed to compound primitives.
 *
 * Primitives (`Editor.Canvas`, `Editor.Section`, `Editor.Toolbar`, etc.) pull
 * everything they need from {@link useEditor}, {@link useEditorSection}, and
 * {@link useEditorCanvas} instead of receiving prop-drilled state. This keeps
 * `Editor.Root` declarative for consumers:
 *
 * ```tsx
 * <Editor.Root defaultDocument={createDocument()}>
 *   <Editor.Canvas>
 *     <Editor.Section />
 *   </Editor.Canvas>
 * </Editor.Root>
 * ```
 */

import {
    getPageDimensionsWithOrientation,
    resolveFrameParent,
    type Document,
    type PageBackground,
    type Section,
    type ShapeKind,
    type Stroke,
    type estimatePDFSize,
    type generatePDF,
    type generatePNGs,
} from '@docmosaic/core';
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    computeGroupBBox,
    computeSnap,
    computeSnapTargets,
    type SnapBBox,
    type SnapTarget,
} from '../primitives/canvas/snap';
import type { GenerationState } from '../primitives/use-pdf-generation';

/**
 * Pluggable PDF backend.
 *
 * Editor.Root resolves these to {@link generatePDF} / {@link estimatePDFSize}
 * from `@docmosaic/core` by default. Consumers can override either function
 * (e.g. to swap jsPDF for `pdf-lib`, mock generation in tests, or run rendering
 * in a Web Worker) via the `pdf` prop on `Editor.Root`.
 */
export interface EditorPdfBackend {
    generate: typeof generatePDF;
    estimate: typeof estimatePDFSize;
    /**
     * PNG export pipeline — one Blob per page. Defaults to the bundled
     * {@link generatePNGs}; overridable alongside `generate` and `estimate`
     * via the `pdf` prop on `Editor.Root`.
     */
    generatePNGs: typeof generatePNGs;
}

/**
 * Options accepted by {@link EditorActions.addSection}.
 */
export interface AddSectionOptions {
    /**
     * Variant to create. Defaults to `'image'` so existing callers (the bundled
     * `AddImageButton`) keep producing image sections.
     */
    type?: 'image' | 'text' | 'shape' | 'drawing' | 'frame';
    /** Picks the primitive when `type === 'shape'`. Ignored for other variants. */
    shape?: ShapeKind;
    /**
     * Explicit geometry in PDF points. When supplied, it overrides the factory's
     * default position/size — used by the draw-to-size shape and frame tools so
     * the new section lands exactly where the user dragged, in a single history
     * step.
     */
    rect?: { x: number; y: number; width: number; height: number };
}

/**
 * Action surface exposed by the editor context.
 *
 * Mirrors the 18-action surface returned from {@link useDocumentState}, so
 * primitives that want to mutate the document can call the same names whether
 * the root is controlled or uncontrolled.
 */
export interface EditorActions {
    undo: () => void;
    redo: () => void;
    /**
     * Append a new section to the current page. See {@link AddSectionOptions}.
     */
    addSection: (opts?: AddSectionOptions) => Section;
    updateSection: (section: Section) => void;
    deleteSection: (sectionId: string) => void;
    duplicateSection: (section: Section) => void;
    /**
     * Append a new stroke to a drawing section. No-op when the target id is
     * not a drawing section.
     */
    addStroke: (sectionId: string, stroke: Stroke) => void;
    /**
     * Empty all strokes from a drawing section. No-op when the target id is
     * not a drawing section.
     */
    clearStrokes: (sectionId: string) => void;
    addPage: () => void;
    deletePage: (pageIndex: number) => void;
    changePage: (pageNumber: number) => void;
    updatePageSize: (pageSize: Document['pageSize']) => void;
    updateOrientation: (orientation: Document['orientation']) => void;
    updateName: (name: string) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;
    updateEstimatedSize: (size: number) => void;
    /**
     * Set (or clear, when `background` is `undefined`) the background for a
     * given page. The background is layered behind sections — color paints
     * first, image on top.
     */
    setPageBackground: (pageIndex: number, background: PageBackground | undefined) => void;
    /** Raise the section above every other section on the same page. */
    bringToFront: (sectionId: string) => void;
    /** Lower the section behind every other section on the same page. */
    sendToBack: (sectionId: string) => void;
    /** Swap zIndex with the next-higher section on the same page (no-op if already on top). */
    moveForward: (sectionId: string) => void;
    /** Swap zIndex with the next-lower section on the same page (no-op if already at the bottom). */
    moveBackward: (sectionId: string) => void;
    /**
     * Flip the section's `hidden` flag. Hidden sections are skipped during
     * canvas and PDF rendering.
     */
    toggleHidden: (sectionId: string) => void;
    /**
     * Flip the section's `locked` flag. Locked sections refuse selection,
     * drag, and resize but stay visible in the canvas and the PDF output.
     */
    toggleLocked: (sectionId: string) => void;
    /** Set the section's `hidden` flag to an explicit value. */
    setHidden: (sectionId: string, hidden: boolean) => void;
    /** Set the section's `locked` flag to an explicit value. */
    setLocked: (sectionId: string, locked: boolean) => void;
    /**
     * Replace the entire document with the given snapshot. Used by
     * `Editor.TemplateGallery` to load a template; in uncontrolled mode the
     * swap goes through the history timeline as a single undoable step.
     */
    loadDocument: (next: Document) => void;
    /**
     * Add a guide line on a page. `axis: 'vertical'` carries an x position;
     * `axis: 'horizontal'` carries a y position. Both in PDF points. Exact
     * duplicates are skipped so repeated drags onto the same value don't grow
     * the underlying array.
     */
    addGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) => void;
    /** Remove a previously-placed guide line. No-op when absent. */
    removeGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) => void;
}

/**
 * PDF generation surface bundled into the editor context.
 *
 * Primitives like the download/print buttons and the preview dialog call
 * these directly instead of receiving the lifecycle as props.
 */
export interface EditorPdfApi {
    state: GenerationState;
    download: () => Promise<void>;
    /**
     * Generate one PNG Blob per page and download a zip-less direct dump —
     * the bundled implementation triggers a sequential save per page.
     * Custom implementations supplied through `Editor.Root` `pdf.generatePNGs`
     * can change that policy (e.g. write a single multi-page TIFF, zip, etc.).
     */
    downloadPNGs: () => Promise<void>;
    print: () => Promise<void>;
    abort: () => void;
    dismissError: () => void;
}

/**
 * Snap guide rendered while a multi-select group is being dragged. Coordinates
 * are in canvas display pixels (raw section coords * `finalScale`) so the
 * `Editor.SnapGuides` primitive can absolutely-position lines without re-doing
 * the transform.
 */
export interface SnapGuide {
    /** Orientation of the guide line. */
    orientation: 'vertical' | 'horizontal';
    /**
     * Position along the cross axis. For `'vertical'` this is the x coordinate;
     * for `'horizontal'` it's the y coordinate. Canvas display pixels.
     */
    position: number;
    /** Optional label for stories / debugging — not rendered by default. */
    label?: string;
}

/**
 * UI-only state the editor tracks for primitive coordination — selected
 * section(s), preview dialog visibility, estimated file size, formatted date.
 *
 * Lives in context so primitives that don't see each other can still
 * synchronise (e.g. the preview button opens the preview dialog rendered
 * elsewhere in the tree).
 */
export interface EditorUiState {
    /**
     * Set of currently selected section ids. Phase 16 grew this from a single
     * id to a multi-select model — callers that need a single id can read
     * {@link selectedSectionId} (first item of the set, kept for backwards
     * compatibility with keyboard nudge / delete bindings and the
     * `addSection` auto-select side effect).
     */
    selectedSectionIds: Set<string>;
    /**
     * First-of-set id, or `null` when the selection is empty. Convenience
     * accessor for primitives written against the pre-Phase-16 single-select
     * surface. Prefer {@link selectedSectionIds} for new code.
     */
    selectedSectionId: string | null;
    /** Replace the selection with a single id (or clear when `null`). */
    setSelectedSectionId: (id: string | null) => void;
    /** Replace the selection with the given ids. */
    selectMany: (ids: ReadonlyArray<string>) => void;
    /** Add an id to the selection (no-op when already present). */
    addToSelection: (id: string) => void;
    /** Remove an id from the selection (no-op when absent). */
    removeFromSelection: (id: string) => void;
    /** Toggle an id in/out of the selection — the shift+click handler. */
    toggleSelection: (id: string) => void;
    /** Empty the selection. */
    clearSelection: () => void;
    isPreviewOpen: boolean;
    openPreview: () => void;
    closePreview: () => void;
    estimatedSize: number;
    setEstimatedSize: (size: number) => void;
    formattedDate: string;
    /**
     * Whether the editor is in freehand drawing mode. While `true`, the
     * canvas captures pointer events as strokes (see Phase 15) instead of
     * performing the normal click-to-deselect behavior.
     */
    drawingMode: boolean;
    setDrawingMode: (on: boolean) => void;
    /**
     * Armed shape primitive for the draw-to-size tool, or `null` when the tool
     * is off. While set, the canvas rubber-bands a new {@link ShapeSection} of
     * this kind on pointer drag instead of marquee-selecting. Mutually
     * exclusive with {@link drawingMode}.
     */
    shapeTool: ShapeKind | null;
    setShapeTool: (shape: ShapeKind | null) => void;
    /**
     * Whether the container-frame draw-to-size tool is armed. While `true`, a
     * pointer drag on the empty page rubber-bands a new {@link FrameSection}
     * instead of marquee-selecting. Mutually exclusive with {@link drawingMode}
     * and {@link shapeTool}.
     */
    frameTool: boolean;
    setFrameTool: (on: boolean) => void;
    /** Active brush color used by the drawing canvas while drawing. */
    drawingColor: string;
    setDrawingColor: (color: string) => void;
    /** Active brush weight (PDF points) used by the drawing canvas. */
    drawingWeight: number;
    setDrawingWeight: (weight: number) => void;
    /**
     * Active snap guides rendered by {@link SnapGuides} while a multi-select
     * group is being dragged. Set by the group drag handler; empty array when
     * not snapping.
     */
    activeSnapGuides: SnapGuide[];
    setActiveSnapGuides: (guides: SnapGuide[]) => void;
}

/**
 * Top-level editor context value.
 */
export interface EditorContextValue {
    state: Document;
    canUndo: boolean;
    canRedo: boolean;
    actions: EditorActions;
    pdfApi: EditorPdfApi;
    /**
     * Resolved PDF backend (generate + estimate). Mirrors what was passed via
     * `Editor.Root` `pdf` prop, falling back to `@docmosaic/core`. Primitives
     * that render PDFs (preview, download) call through this rather than
     * importing the core helpers directly.
     */
    pdfBackend: EditorPdfBackend;
    ui: EditorUiState;
    /**
     * When `true`, the editor renders as a viewer — every mutating interaction
     * (drag, resize, drop, file upload, page add/delete/reorder, undo/redo,
     * keyboard nudge/delete, drawing-mode strokes) is suppressed and the
     * mutating toolbar buttons hide themselves. Selection, marquee selection,
     * zoom, preview, print, and download stay live.
     *
     * Set by `Editor.Root` `readOnly` prop, and also locally by
     * `Editor.StaticCanvas` (which forces the canvas it wraps into read-only
     * even when the root isn't).
     */
    readOnly: boolean;
    /**
     * Display flags forwarded from `Editor.Root` to the Canvas so it can
     * decide whether to auto-mount the Phase 29 polish overlays (rulers,
     * minimap). Independent from the actual primitives — consumers can still
     * render `Editor.Ruler` / `Editor.Minimap` manually instead of flipping
     * these flags.
     */
    display: {
        /**
         * Reserve viewport gutters for `Editor.Ruler` and auto-mount it as a
         * canvas overlay. Off by default; flip on through the `showRuler`
         * prop on `Editor.Root`.
         */
        showRuler: boolean;
        /**
         * Auto-mount `Editor.Minimap` in the bottom-right of the canvas
         * viewport. Off by default; flip on through the `showMinimap` prop
         * on `Editor.Root`.
         */
        showMinimap: boolean;
        /**
         * Display unit used by `Editor.Ruler` tick labels. Points are the
         * canonical storage unit; mm/in are converted from points at paint
         * time. Defaults to `'pt'`.
         */
        rulerUnit: 'pt' | 'mm' | 'in';
    };
}

const EditorContext = createContext<EditorContextValue | null>(null);

/**
 * Provider mounted by `Editor.Root`. Consumers should not render this
 * directly — use `Editor.Root` to get the full controlled/uncontrolled prop
 * surface and the surrounding DnD/config providers.
 *
 * @internal Exposed for advanced "BYO-UI" composition where the caller owns
 * state via {@link useDocumentState} and wants compound primitives to read
 * from a custom-built {@link EditorContextValue}.
 */
export function EditorProvider({
    value,
    children,
}: {
    value: EditorContextValue;
    children: ReactNode;
}) {
    return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/**
 * Hook returning the active editor context.
 *
 * Throws when called outside an `Editor.Root` — primitives that rely on the
 * document don't have a meaningful default to fall back on.
 *
 * @returns The full {@link EditorContextValue}: document state, undo/redo
 * flags, mutating {@link EditorActions}, the {@link EditorPdfApi} generation
 * surface, the resolved {@link EditorPdfBackend}, and shared {@link EditorUiState}.
 * @throws {Error} When called outside `<Editor.Root>`.
 *
 * @example
 * ```tsx
 * import { Editor, useEditor } from '@docmosaic/react';
 *
 * function PageCount() {
 *   const { state } = useEditor();
 *   return <span>Page {state.currentPage} / {state.pages.length}</span>;
 * }
 *
 * <Editor.Root>
 *   <Editor.Properties />
 *   <PageCount />
 *   <Editor.Canvas />
 * </Editor.Root>
 * ```
 *
 * @see {@link useEditorSection} for per-section context (inside `Editor.Canvas`).
 * @see {@link useEditorCanvas} for zoom/pan viewport state.
 */
export function useEditor(): EditorContextValue {
    const ctx = useContext(EditorContext);
    if (!ctx) {
        throw new Error('useEditor must be used inside <Editor.Root>');
    }
    return ctx;
}

/**
 * Per-section context. Populated by the Canvas while iterating sections so
 * that {@link useEditorSection} (called inside `Editor.Section`) can resolve
 * "which section am I?" without a prop.
 */
interface EditorSectionContextValue {
    /** Section data in canvas coordinates (already scaled). */
    section: Section;
    /** Section data in raw document coordinates (PDF points). */
    rawSection: Section;
    isSelected: boolean;
    /** Current canvas display scale (`pageScale * zoom`). */
    finalScale: number;
    /**
     * Whether the wrapping canvas is in read-only mode. The Canvas folds the
     * root's `readOnly` with its own override so a single boolean reaches
     * each section view.
     */
    readOnly: boolean;
}

const EditorSectionContext = createContext<EditorSectionContextValue | null>(null);

/**
 * @internal Provider mounted internally by `Editor.Canvas` around each
 * section iteration so {@link useEditorSection} can resolve the current
 * section without a prop.
 */
export function EditorSectionProvider({
    value,
    children,
}: {
    value: EditorSectionContextValue;
    children: ReactNode;
}) {
    return <EditorSectionContext.Provider value={value}>{children}</EditorSectionContext.Provider>;
}

/**
 * Group-drag handlers exposed by {@link useEditorSection}. When the active
 * selection contains more than one section, the section's individual drag
 * routes through these so all selected sections translate together and snap
 * guides activate.
 */
export interface UseEditorSectionGroupDrag {
    /** Selection size at the time of the hook call. */
    size: number;
    /** Snapshot the original positions and seed snap targets for the drag. */
    onStart: () => void;
    /**
     * Apply a translation delta (display pixels, same units the gesture
     * library hands out) to every selected section, snapping to targets when
     * within {@link SNAP_THRESHOLD}.
     */
    onMove: (dx: number, dy: number) => void;
    /** Drop the snapshot and clear active guides. */
    onEnd: () => void;
}

/**
 * Returned by {@link useEditorSection}: the section data plus the bound
 * handlers callers wire to the visual primitive.
 */
export interface UseEditorSectionResult {
    section: Section;
    /**
     * Section in raw document coordinates (PDF points), before the Canvas
     * applies its display scale. Use this when persisting geometry or when
     * a child needs the un-scaled box (e.g. the drawing canvas viewBox).
     */
    rawSection: Section;
    isSelected: boolean;
    finalScale: number;
    /**
     * Mirror of {@link EditorContextValue.readOnly} folded with the canvas-
     * level override. Sections use this to suppress drag, resize, file drop,
     * and to hide the floating toolbar.
     */
    readOnly: boolean;
    onClick: (e: React.MouseEvent) => void;
    onUpdate: (next: Section) => void;
    /**
     * Frame adoption — call when a drag gesture ends. Recomputes whether this
     * section now sits inside a container frame (by center-point containment),
     * stamping or clearing {@link SectionBase.parentFrameId} accordingly.
     * No-op for frames and drawings, which never become children.
     */
    onDragEnd: () => void;
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    onDuplicate: (section: Section) => void;
    onDelete: (sectionId: string) => void;
    onBringToFront: (sectionId: string) => void;
    onSendToBack: (sectionId: string) => void;
    onMoveForward: (sectionId: string) => void;
    onMoveBackward: (sectionId: string) => void;
    /**
     * Group-drag handlers. Always defined; the hook returns a stub with
     * `size === 1` for single-select so callers can wire the drag without
     * a conditional.
     */
    groupDrag: UseEditorSectionGroupDrag;
}

/**
 * Hook for `Editor.Section`. Resolves the section being rendered and binds
 * the canvas-aware update/select/delete handlers so the section component
 * stays prop-free.
 *
 * The id is implicit: the Canvas wraps each iteration in
 * {@link EditorSectionProvider}, so `useEditorSection()` reads "the current
 * section" from context. Throws when called outside the Canvas.
 */
export function useEditorSection(): UseEditorSectionResult {
    const editor = useEditor();
    const ctx = useContext(EditorSectionContext);
    if (!ctx) {
        throw new Error('useEditorSection must be used inside <Editor.Canvas>');
    }
    const { section, rawSection, isSelected, finalScale, readOnly } = ctx;
    const { actions, ui, state } = editor;

    const onUpdate = useCallback(
        (next: Section) => {
            actions.updateSection({
                ...next,
                x: next.x / finalScale,
                y: next.y / finalScale,
                width: next.width / finalScale,
                height: next.height / finalScale,
            });
        },
        [actions, finalScale],
    );

    // ----- Group drag (Phase 16) ----------------------------------------------
    //
    // When the active selection is multi-section, the per-section drag wires
    // through these handlers. The snapshot lives in a ref so successive
    // `onMove` calls keep referring to the original positions even as state
    // updates re-render the component.
    const groupDragSnapshot = useRef<{
        positions: Map<string, { x: number; y: number; width: number; height: number }>;
        bbox: SnapBBox;
        targets: SnapTarget[];
    } | null>(null);

    const selectedSectionIds = ui.selectedSectionIds;
    const currentPage = state.currentPage;
    const pageSize = state.pageSize;
    const orientation = state.orientation;
    const sectionsRef = useRef(state.sections);
    sectionsRef.current = state.sections;
    // Mirror sections — page guides participate in snap math so group drag
    // sticks to ruler-dragged lines just like it does to page mid-lines.
    const pagesRef = useRef(state.pages);
    pagesRef.current = state.pages;
    const setActiveSnapGuides = ui.setActiveSnapGuides;

    const groupDrag = useMemo<UseEditorSectionGroupDrag>(() => {
        const size = selectedSectionIds.size;

        const onStart = () => {
            const selected = sectionsRef.current.filter(
                (s) => selectedSectionIds.has(s.id) && s.page === currentPage,
            );
            const bbox = computeGroupBBox(selected);
            if (!bbox) return;
            const positions = new Map(
                selected.map((s) => [s.id, { x: s.x, y: s.y, width: s.width, height: s.height }]),
            );
            const pageDims = getPageDimensionsWithOrientation(pageSize, orientation);
            const pageGuides = pagesRef.current[currentPage - 1]?.guides;
            const targets = computeSnapTargets(
                sectionsRef.current.filter((s) => s.page === currentPage),
                selectedSectionIds,
                pageDims ?? { width: 0, height: 0 },
                pageGuides,
            );
            groupDragSnapshot.current = { positions, bbox, targets };
        };

        const onMove = (dxPx: number, dyPx: number) => {
            const snapshot = groupDragSnapshot.current;
            if (!snapshot) return;
            const dx = dxPx / finalScale;
            const dy = dyPx / finalScale;
            const snap = computeSnap(snapshot.bbox, dx, dy, snapshot.targets);
            for (const s of sectionsRef.current) {
                if (!selectedSectionIds.has(s.id)) continue;
                const start = snapshot.positions.get(s.id);
                if (!start) continue;
                actions.updateSection({
                    ...s,
                    x: Math.round(start.x + snap.dx),
                    y: Math.round(start.y + snap.dy),
                });
            }
            // Convert matched targets to display-pixel guides for rendering.
            setActiveSnapGuides(
                snap.matched.map((t) => ({
                    orientation: t.orientation,
                    position: t.position * finalScale,
                    label: t.source,
                })),
            );
        };

        const onEnd = () => {
            groupDragSnapshot.current = null;
            setActiveSnapGuides([]);
            // Frame adoption for the WHOLE moved selection — the single-section
            // `onDragEnd` only re-parents the grabbed section, so without this a
            // multi-select dragged into/out of a frame would leave the other
            // members with a stale `parentFrameId`.
            for (const s of sectionsRef.current) {
                if (!selectedSectionIds.has(s.id)) continue;
                const nextParent = resolveFrameParent(s, sectionsRef.current);
                if (s.parentFrameId !== nextParent) {
                    actions.updateSection({ ...s, parentFrameId: nextParent });
                }
            }
        };

        return { size, onStart, onMove, onEnd };
    }, [
        actions,
        currentPage,
        finalScale,
        orientation,
        pageSize,
        selectedSectionIds,
        setActiveSnapGuides,
    ]);

    const onImageUpload = useCallback(
        (_sectionId: string, imageUrl: string) => {
            // Read from rawSection so we don't accidentally pollute geometry
            // with the scaled values from the wrapping section context.
            // Only image sections carry imageUrl — guard the narrow path
            // explicitly rather than coercing types at the call site.
            if (rawSection.type !== 'image') return;
            actions.updateSection({ ...rawSection, imageUrl });
        },
        [actions, rawSection],
    );

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            // Locked sections refuse selection — the click is consumed
            // (stopPropagation above) so it doesn't clear the existing
            // selection either, but the lock stays the floor.
            if (rawSection.locked) return;
            // Shift / meta toggles the section in/out of selection without
            // touching the other selected ids. Plain click replaces the
            // selection — matches the convention from Figma / Sketch.
            if (e.shiftKey || e.metaKey) {
                ui.toggleSelection(rawSection.id);
                return;
            }
            ui.setSelectedSectionId(rawSection.id);
        },
        [rawSection.id, rawSection.locked, ui],
    );

    // Frame adoption — after a drag, decide whether this section now belongs to
    // a container frame (top-most frame whose box contains its center), or
    // release it when dragged out of every frame. Reads the live section from
    // the ref so it sees the just-committed drag position. The containment rule
    // is the pure `resolveFrameParent` so it stays unit-tested in core.
    const onDragEnd = useCallback(() => {
        const sec = sectionsRef.current.find((s) => s.id === rawSection.id);
        if (!sec) return;
        const nextParent = resolveFrameParent(sec, sectionsRef.current);
        if (sec.parentFrameId !== nextParent) {
            actions.updateSection({ ...sec, parentFrameId: nextParent });
        }
    }, [actions, rawSection.id]);

    // Locked sections fold into readOnly so the existing drag/resize/file
    // drop/toolbar guards short-circuit without each variant having to know
    // about `section.locked` directly. The properties panel still reads the
    // raw section, so locked properties remain inspectable.
    const effectiveReadOnly = readOnly || rawSection.locked === true;

    return {
        section,
        rawSection,
        isSelected,
        finalScale,
        readOnly: effectiveReadOnly,
        onClick,
        onUpdate,
        onDragEnd,
        onImageUpload,
        onDuplicate: actions.duplicateSection,
        onDelete: actions.deleteSection,
        onBringToFront: actions.bringToFront,
        onSendToBack: actions.sendToBack,
        onMoveForward: actions.moveForward,
        onMoveBackward: actions.moveBackward,
        groupDrag,
    };
}

/**
 * Per-canvas context: the viewport state (page scale, zoom, pan) shared
 * between Canvas and its CanvasControls child.
 */
interface EditorCanvasContextValue {
    /** Auto-fit page scale derived from container size. */
    pageScale: number;
    /** Manual zoom multiplier (1 = 100%). */
    zoom: number;
    minZoom: number;
    maxZoom: number;
    /** Combined display scale: `pageScale * zoom`. */
    finalScale: number;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
}

const EditorCanvasContext = createContext<EditorCanvasContextValue | null>(null);

/**
 * @internal Provider mounted internally by `Editor.Canvas` so children like
 * `Editor.CanvasControls` can read zoom state via {@link useEditorCanvas}.
 */
export function EditorCanvasProvider({
    value,
    children,
}: {
    value: EditorCanvasContextValue;
    children: ReactNode;
}) {
    return <EditorCanvasContext.Provider value={value}>{children}</EditorCanvasContext.Provider>;
}

/**
 * Hook returning the active canvas viewport state.
 *
 * Used by `Editor.CanvasControls` (zoom buttons). Throws when called outside
 * an `Editor.Canvas`.
 */
export function useEditorCanvas(): EditorCanvasContextValue {
    const ctx = useContext(EditorCanvasContext);
    if (!ctx) {
        throw new Error('useEditorCanvas must be used inside <Editor.Canvas>');
    }
    return ctx;
}

/**
 * @internal Build the {@link EditorUiState} value mounted into context by
 * `Editor.Root`. Kept here so the root component stays focused on wiring.
 */
export function useEditorUiState(formattedDate: string): EditorUiState {
    const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(
        () => new Set<string>(),
    );
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [estimatedSize, setEstimatedSize] = useState(0);
    const [drawingMode, setDrawingMode] = useState(false);
    const [shapeTool, setShapeTool] = useState<ShapeKind | null>(null);
    const [frameTool, setFrameTool] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#000000');
    const [drawingWeight, setDrawingWeight] = useState(3);
    const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([]);

    const setSelectedSectionId = useCallback((id: string | null) => {
        setSelectedSectionIds(id === null ? new Set<string>() : new Set([id]));
    }, []);

    const selectMany = useCallback((ids: ReadonlyArray<string>) => {
        setSelectedSectionIds(new Set(ids));
    }, []);

    const addToSelection = useCallback((id: string) => {
        setSelectedSectionIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const removeFromSelection = useCallback((id: string) => {
        setSelectedSectionIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const toggleSelection = useCallback((id: string) => {
        setSelectedSectionIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedSectionIds((prev) => (prev.size === 0 ? prev : new Set<string>()));
    }, []);

    // First-of-set accessor. Iteration order of a Set follows insertion order,
    // so callers that only care about a single id (e.g. keyboard nudge) get a
    // stable choice rather than an arbitrary one.
    const selectedSectionId = useMemo<string | null>(() => {
        const first = selectedSectionIds.values().next();
        return first.done ? null : first.value;
    }, [selectedSectionIds]);

    return useMemo(
        () => ({
            selectedSectionIds,
            selectedSectionId,
            setSelectedSectionId,
            selectMany,
            addToSelection,
            removeFromSelection,
            toggleSelection,
            clearSelection,
            isPreviewOpen,
            openPreview: () => setIsPreviewOpen(true),
            closePreview: () => setIsPreviewOpen(false),
            estimatedSize,
            setEstimatedSize,
            formattedDate,
            drawingMode,
            setDrawingMode,
            shapeTool,
            setShapeTool,
            frameTool,
            setFrameTool,
            drawingColor,
            setDrawingColor,
            drawingWeight,
            setDrawingWeight,
            activeSnapGuides,
            setActiveSnapGuides,
        }),
        [
            selectedSectionIds,
            selectedSectionId,
            setSelectedSectionId,
            selectMany,
            addToSelection,
            removeFromSelection,
            toggleSelection,
            clearSelection,
            isPreviewOpen,
            estimatedSize,
            formattedDate,
            drawingMode,
            shapeTool,
            frameTool,
            drawingColor,
            drawingWeight,
            activeSnapGuides,
        ],
    );
}
