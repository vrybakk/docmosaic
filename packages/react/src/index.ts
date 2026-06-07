/**
 * @packageDocumentation
 * `@docmosaic/react` — UI primitives for the DocMosaic editor.
 *
 * Phase 7g/7h ships controlled/uncontrolled `Editor.Root` plus hook-based
 * state plumbing. Compound primitives reach into {@link useEditor},
 * {@link useEditorSection}, and {@link useEditorCanvas} for everything they
 * need; consumers compose the tree without prop-drilling.
 *
 * ```tsx
 * import { Editor } from '@docmosaic/react';
 *
 * <Editor.Root>
 *   <Editor.Properties />
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.Pages />
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 */

import { Root } from './primitives/editor-root';
import { BrushWeightSlider } from './primitives/brush-weight-slider';
import { Canvas } from './primitives/canvas';
import { CanvasControls } from './primitives/canvas/canvas-controls';
import { SelectionBounds } from './primitives/canvas/selection-bounds';
import { SnapGuides } from './primitives/canvas/snap-guides';
import { StaticCanvas } from './primitives/canvas/static-canvas';
import { ColorPicker } from './primitives/color-picker';
import { DrawingControls } from './primitives/drawing-controls';
import { Section } from './primitives/section';
import { Pages } from './primitives/pages';
import { PageThumbnail } from './primitives/pages/page-thumbnail';
import { Toolbar } from './primitives/toolbar';
import { UndoButton } from './primitives/toolbar/undo-button';
import { RedoButton } from './primitives/toolbar/redo-button';
import { PreviewButton } from './primitives/toolbar/preview-button';
import { PrintButton } from './primitives/toolbar/print-button';
import { DownloadButton } from './primitives/toolbar/download-button';
import { AddImageButton } from './primitives/toolbar/add-image-button';
import { AddShapeButton } from './primitives/toolbar/add-shape-button';
import { AddTextButton } from './primitives/toolbar/add-text-button';
import { DrawButton } from './primitives/toolbar/draw-button';
import { PageBackground } from './primitives/page-background';
import { FileSizeBadge } from './primitives/toolbar/file-size-badge';
import { GenerationProgress } from './primitives/toolbar/generation-progress';
import { Properties } from './primitives/properties';
import { DocumentName } from './primitives/properties/document-name';
import { PageSizeSelect } from './primitives/properties/page-size-select';
import { OrientationSelect } from './primitives/properties/orientation-select';
import { Preview } from './primitives/preview';
import { PropertiesPanel } from './primitives/properties-panel';
import { TemplateGallery } from './primitives/template-gallery';
import { Zoom } from './primitives/zoom';
import { KeybindingHelp } from './primitives/keybinding-help';
import { LayerList } from './primitives/layer-list';
import { ContextMenu } from './primitives/context-menu';
import { Toaster } from './primitives/toaster';

/**
 * Compound primitive namespace for the DocMosaic editor.
 *
 * `Editor.Root` owns the document state (controlled or uncontrolled) and
 * the surrounding DnD + config providers. Every other member reads from
 * the editor context exposed by {@link useEditor} — children are placed
 * freely in the tree without prop drilling.
 *
 * @remarks
 * Members:
 * - `Root` — orchestrator + default shell.
 * - `Properties` (+ `DocumentName`, `PageSizeSelect`, `OrientationSelect`) —
 *   document-properties bar at the top.
 * - `Toolbar` (+ `UndoButton`, `RedoButton`, `PreviewButton`, `PrintButton`,
 *   `DownloadButton`, `AddImageButton`, `AddTextButton`, `AddShapeButton`,
 *   `DrawButton`, `FileSizeBadge`, `GenerationProgress`).
 * - `DrawingControls` (+ `ColorPicker`, `BrushWeightSlider`) — drawing-mode
 *   side panel.
 * - `Pages` (+ `PageThumbnail`) — left sidebar of page thumbnails.
 * - `PageBackground` — color + image picker for `Page.background`.
 * - `Canvas` (+ `CanvasControls`, `Section`) — interactive workspace.
 * - `StaticCanvas` — read-only canvas variant; equivalent to `Canvas readOnly`.
 * - `PropertiesPanel` (+ `Layout`, `Text`, `Shape`, `Layer`, `EmptyState`) —
 *   contextual right-side panel that reflects the selected section(s).
 * - `LayerList` (+ `Row`) — Figma/Photoshop-style outliner listing every
 *   section on the current page with hide/lock toggles and drag-reorder.
 * - `ContextMenu` — right-click menu wrapper that auto-discriminates between
 *   the section menu (copy / duplicate / delete / layer order / hide / lock)
 *   and the canvas menu (paste / select all / deselect).
 * - `Toaster` — `react-hot-toast` toaster styled with semantic tokens.
 * - `Preview` — full-document preview dialog.
 *
 * @example
 * ```tsx
 * import { Editor } from '@docmosaic/react';
 * import '@docmosaic/react/styles.css';
 *
 * export function MyEditor() {
 *   return (
 *     <Editor.Root>
 *       <Editor.Properties />
 *       <Editor.Toolbar />
 *       <Editor.Pages />
 *       <Editor.Canvas>
 *         <Editor.Section />
 *       </Editor.Canvas>
 *       <Editor.Preview />
 *     </Editor.Root>
 *   );
 * }
 * ```
 *
 * @see {@link useEditor} for the per-render context value.
 * @see {@link useDocumentState} for the headless ("BYO-UI") state hook.
 */
export const Editor = {
    Root,
    Canvas,
    StaticCanvas,
    CanvasControls,
    SelectionBounds,
    SnapGuides,
    Section,
    Pages,
    PageThumbnail,
    Toolbar,
    UndoButton,
    RedoButton,
    PreviewButton,
    PrintButton,
    DownloadButton,
    AddImageButton,
    AddTextButton,
    AddShapeButton,
    DrawButton,
    DrawingControls,
    ColorPicker,
    BrushWeightSlider,
    PageBackground,
    FileSizeBadge,
    GenerationProgress,
    Properties,
    DocumentName,
    PageSizeSelect,
    OrientationSelect,
    Preview,
    PropertiesPanel,
    TemplateGallery,
    Zoom,
    KeybindingHelp,
    LayerList,
    ContextMenu,
    Toaster,
    /** @deprecated Use `Editor.Properties` instead. Removed in next major. */
    Inspector: Properties,
    /** @deprecated Use `Editor.PageBackground` instead. Removed in next major. */
    PageBackgroundPicker: PageBackground,
    /** @deprecated Use `Editor.FileSizeBadge` instead. Removed in next major. */
    EstimatedSize: FileSizeBadge,
    /** @deprecated Use `Editor.GenerationProgress` instead. Removed in next major. */
    ProgressOverlay: GenerationProgress,
    /** @deprecated Use `Editor.AddImageButton` instead. Removed in next major. */
    AddSectionButton: AddImageButton,
    /** @deprecated Use `Editor.Pages` instead. Removed in next major. */
    PageList: Pages,
    /** @deprecated Use `Editor.PageThumbnail` instead. Removed in next major. */
    PageThumb: PageThumbnail,
} as const;

/**
 * Flat named exports — tree-shake-friendly alternative to the `Editor.*`
 * namespace. Each primitive is also reachable as `EditorXxx` so bundlers can
 * drop unused primitives without traversing the namespace object.
 *
 * @example
 * ```tsx
 * import { EditorRoot, EditorCanvas, EditorSection } from '@docmosaic/react';
 *
 * <EditorRoot>
 *   <EditorCanvas>
 *     <EditorSection />
 *   </EditorCanvas>
 * </EditorRoot>;
 * ```
 */
export { Root as EditorRoot } from './primitives/editor-root';
export { Canvas as EditorCanvas, type CanvasProps as EditorCanvasProps } from './primitives/canvas';
export { StaticCanvas as EditorStaticCanvas } from './primitives/canvas/static-canvas';
export { CanvasControls as EditorCanvasControls } from './primitives/canvas/canvas-controls';
export { SelectionBounds as EditorSelectionBounds } from './primitives/canvas/selection-bounds';
export { SnapGuides as EditorSnapGuides } from './primitives/canvas/snap-guides';
export { Section as EditorSection } from './primitives/section';
export { Pages as EditorPages } from './primitives/pages';
export { PageThumbnail as EditorPageThumbnail } from './primitives/pages/page-thumbnail';
export { Toolbar as EditorToolbar } from './primitives/toolbar';
export { UndoButton as EditorUndoButton } from './primitives/toolbar/undo-button';
export { RedoButton as EditorRedoButton } from './primitives/toolbar/redo-button';
export { PreviewButton as EditorPreviewButton } from './primitives/toolbar/preview-button';
export { PrintButton as EditorPrintButton } from './primitives/toolbar/print-button';
export { DownloadButton as EditorDownloadButton } from './primitives/toolbar/download-button';
export { AddImageButton as EditorAddImageButton } from './primitives/toolbar/add-image-button';
export { AddTextButton as EditorAddTextButton } from './primitives/toolbar/add-text-button';
export { AddShapeButton as EditorAddShapeButton } from './primitives/toolbar/add-shape-button';
export { DrawButton as EditorDrawButton } from './primitives/toolbar/draw-button';
export { DrawingControls as EditorDrawingControls } from './primitives/drawing-controls';
export { ColorPicker as EditorColorPicker } from './primitives/color-picker';
export { BrushWeightSlider as EditorBrushWeightSlider } from './primitives/brush-weight-slider';
export { PageBackground as EditorPageBackground } from './primitives/page-background';
export { FileSizeBadge as EditorFileSizeBadge } from './primitives/toolbar/file-size-badge';
export { GenerationProgress as EditorGenerationProgress } from './primitives/toolbar/generation-progress';
export { Properties as EditorProperties } from './primitives/properties';
export { DocumentName as EditorDocumentName } from './primitives/properties/document-name';
export { PageSizeSelect as EditorPageSizeSelect } from './primitives/properties/page-size-select';
export { OrientationSelect as EditorOrientationSelect } from './primitives/properties/orientation-select';
export { Preview as EditorPreview } from './primitives/preview';
export { PropertiesPanel as EditorPropertiesPanel } from './primitives/properties-panel';
export { TemplateGallery as EditorTemplateGallery } from './primitives/template-gallery';
export { Zoom as EditorZoom, type ZoomProps as EditorZoomProps } from './primitives/zoom';
export {
    KeybindingHelp as EditorKeybindingHelp,
    type KeybindingHelpProps as EditorKeybindingHelpProps,
} from './primitives/keybinding-help';
export {
    LayerList as EditorLayerList,
    type LayerListProps as EditorLayerListProps,
} from './primitives/layer-list';
export { LayerRow as EditorLayerRow } from './primitives/layer-list/layer-row';
export type { LayerRowProps as EditorLayerRowProps } from './primitives/layer-list/layer-row';
export {
    ContextMenu as EditorContextMenu,
    type ContextMenuProps as EditorContextMenuProps,
} from './primitives/context-menu';
export {
    Toaster as EditorToaster,
    type ToasterProps as EditorToasterProps,
} from './primitives/toaster';
/**
 * Re-export of `react-hot-toast`'s `toast` helper. Fire toasts from anywhere
 * — they only render when an `Editor.Toaster` is mounted in the tree.
 */
export { toast } from 'react-hot-toast';

export type { TemplateGalleryItem, TemplateGalleryProps } from './primitives/template-gallery';

export type { EditorRootProps } from './primitives/editor-root';

export { EditorLayout } from './primitives/editor-layout';
export { usePdfGeneration } from './primitives/use-pdf-generation';
export type { GenerationState } from './primitives/use-pdf-generation';

export {
    EditorConfigContext,
    EditorConfigProvider,
    defaultImageRenderer,
    useEditorConfig,
} from './context/editor-config';
export type {
    EditorConfig,
    ImageRenderer,
    ImageRendererProps,
} from './context/editor-config';

/**
 * Hook returning the active editor context. Composed primitives use this
 * to read document state and dispatch mutations without prop drilling.
 *
 * Pair with {@link useDocumentState} when you want to drive a custom
 * `Editor.Root`-style provider; in that case you're responsible for
 * mounting your own `EditorProvider`.
 */
export {
    useEditor,
    useEditorCanvas,
    useEditorSection,
    EditorProvider,
} from './context/editor';
export type {
    EditorActions,
    EditorContextValue,
    EditorPdfApi,
    EditorPdfBackend,
    EditorUiState,
    SnapGuide,
    UseEditorSectionGroupDrag,
    UseEditorSectionResult,
} from './context/editor';

/**
 * Headless document-state escape hatch. Owns the reducer + history
 * timeline. Use directly when wiring a fully-custom UI ("BYO-UI") —
 * combine with {@link EditorProvider} if you want compound primitives to
 * see the same state. The default `Editor.Root` already uses this under
 * the hood in uncontrolled mode.
 */
export { useDocumentState } from './hooks/use-document-state';

export {
    DEFAULT_KEYMAP,
    useEditorKeybindings,
} from './hooks/use-editor-keybindings';
export type { EditorKeybinding, EditorKeymap } from './hooks/use-editor-keybindings';

export { useEditorZoom } from './hooks/use-editor-zoom';
export type { UseEditorZoomResult } from './hooks/use-editor-zoom';

export { setReactPackageTracker } from './internal/analytics';
export type { AnalyticsTracker } from './internal/analytics';
