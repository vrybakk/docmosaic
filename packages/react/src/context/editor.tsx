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

import type { Document, ImageSection, estimatePDFSize, generatePDF } from '@docmosaic/core';
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
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
}

/**
 * Action surface exposed by the editor context.
 *
 * Mirrors the 14-action surface returned from {@link useDocumentState}, so
 * primitives that want to mutate the document can call the same names whether
 * the root is controlled or uncontrolled.
 */
export interface EditorActions {
    undo: () => void;
    redo: () => void;
    addSection: () => ImageSection;
    updateSection: (section: ImageSection) => void;
    deleteSection: (sectionId: string) => void;
    duplicateSection: (section: ImageSection) => void;
    addPage: () => void;
    deletePage: (pageIndex: number) => void;
    changePage: (pageNumber: number) => void;
    updatePageSize: (pageSize: Document['pageSize']) => void;
    updateOrientation: (orientation: Document['orientation']) => void;
    updateName: (name: string) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;
    updateEstimatedSize: (size: number) => void;
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
    print: () => Promise<void>;
    abort: () => void;
    dismissError: () => void;
}

/**
 * UI-only state the editor tracks for primitive coordination — selected
 * section, preview dialog visibility, estimated file size, formatted date.
 *
 * Lives in context so primitives that don't see each other can still
 * synchronise (e.g. the preview button opens the preview dialog rendered
 * elsewhere in the tree).
 */
export interface EditorUiState {
    selectedSectionId: string | null;
    setSelectedSectionId: (id: string | null) => void;
    isPreviewOpen: boolean;
    openPreview: () => void;
    closePreview: () => void;
    estimatedSize: number;
    setEstimatedSize: (size: number) => void;
    formattedDate: string;
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
}

const EditorContext = createContext<EditorContextValue | null>(null);

/**
 * Provider mounted by `Editor.Root`. Consumers should not render this
 * directly — use `Editor.Root` to get the full controlled/uncontrolled prop
 * surface and the surrounding DnD/config providers.
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
    section: ImageSection;
    /** Section data in raw document coordinates (PDF points). */
    rawSection: ImageSection;
    isSelected: boolean;
    /** Current canvas display scale (`pageScale * zoom`). */
    finalScale: number;
}

const EditorSectionContext = createContext<EditorSectionContextValue | null>(null);

export function EditorSectionProvider({
    value,
    children,
}: {
    value: EditorSectionContextValue;
    children: ReactNode;
}) {
    return (
        <EditorSectionContext.Provider value={value}>{children}</EditorSectionContext.Provider>
    );
}

/**
 * Returned by {@link useEditorSection}: the section data plus the bound
 * handlers callers wire to the visual primitive.
 */
export interface UseEditorSectionResult {
    section: ImageSection;
    isSelected: boolean;
    finalScale: number;
    onClick: (e: React.MouseEvent) => void;
    onUpdate: (next: ImageSection) => void;
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    onDuplicate: (section: ImageSection) => void;
    onDelete: (sectionId: string) => void;
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
    const { section, rawSection, isSelected, finalScale } = ctx;
    const { actions, ui } = editor;

    const onUpdate = useCallback(
        (next: ImageSection) => {
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

    const onImageUpload = useCallback(
        (sectionId: string, imageUrl: string) => {
            // Read from rawSection so we don't accidentally pollute geometry
            // with the scaled values from the wrapping section context.
            actions.updateSection({ ...rawSection, imageUrl });
        },
        [actions, rawSection],
    );

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            ui.setSelectedSectionId(rawSection.id);
        },
        [rawSection.id, ui],
    );

    return {
        section,
        isSelected,
        finalScale,
        onClick,
        onUpdate,
        onImageUpload,
        onDuplicate: actions.duplicateSection,
        onDelete: actions.deleteSection,
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

export function EditorCanvasProvider({
    value,
    children,
}: {
    value: EditorCanvasContextValue;
    children: ReactNode;
}) {
    return (
        <EditorCanvasContext.Provider value={value}>{children}</EditorCanvasContext.Provider>
    );
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
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [estimatedSize, setEstimatedSize] = useState(0);

    return useMemo(
        () => ({
            selectedSectionId,
            setSelectedSectionId,
            isPreviewOpen,
            openPreview: () => setIsPreviewOpen(true),
            closePreview: () => setIsPreviewOpen(false),
            estimatedSize,
            setEstimatedSize,
            formattedDate,
        }),
        [selectedSectionId, isPreviewOpen, estimatedSize, formattedDate],
    );
}
