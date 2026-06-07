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
 *   <Editor.Inspector />
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
import { AddSectionButton } from './primitives/toolbar/add-section-button';
import { AddShapeButton } from './primitives/toolbar/add-shape-button';
import { AddTextButton } from './primitives/toolbar/add-text-button';
import { DrawButton } from './primitives/toolbar/draw-button';
import { PageBackgroundPicker } from './primitives/page-background-picker';
import { EstimatedSize } from './primitives/toolbar/estimated-size';
import { ProgressOverlay } from './primitives/toolbar/progress-overlay';
import { Inspector } from './primitives/inspector';
import { DocumentName } from './primitives/inspector/document-name';
import { PageSizeSelect } from './primitives/inspector/page-size-select';
import { OrientationSelect } from './primitives/inspector/orientation-select';
import { Preview } from './primitives/preview';
import { PropertiesPanel } from './primitives/properties-panel';
import { TemplateGallery } from './primitives/template-gallery';

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
 * - `Inspector` (+ `DocumentName`, `PageSizeSelect`, `OrientationSelect`) —
 *   document-properties bar at the top.
 * - `Toolbar` (+ `UndoButton`, `RedoButton`, `PreviewButton`, `PrintButton`,
 *   `DownloadButton`, `AddSectionButton`, `AddTextButton`, `AddShapeButton`,
 *   `DrawButton`, `EstimatedSize`, `ProgressOverlay`).
 * - `DrawingControls` (+ `ColorPicker`, `BrushWeightSlider`) — drawing-mode
 *   side panel.
 * - `Pages` (+ `PageThumbnail`) — left sidebar of page thumbnails.
 * - `PageBackgroundPicker` — color + image picker for `Page.background`.
 * - `Canvas` (+ `CanvasControls`, `Section`) — interactive workspace.
 * - `PropertiesPanel` (+ `Layout`, `Text`, `Shape`, `Layer`, `EmptyState`) —
 *   contextual right-side panel that reflects the selected section(s).
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
 *       <Editor.Inspector />
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
    AddSectionButton,
    AddTextButton,
    AddShapeButton,
    DrawButton,
    DrawingControls,
    ColorPicker,
    BrushWeightSlider,
    PageBackgroundPicker,
    EstimatedSize,
    ProgressOverlay,
    Inspector,
    DocumentName,
    PageSizeSelect,
    OrientationSelect,
    Preview,
    PropertiesPanel,
    TemplateGallery,
    /** @deprecated Use `Editor.Inspector` instead. Removed in next major. */
    Header: Inspector,
    /** @deprecated Use `Editor.Pages` instead. Removed in next major. */
    PageList: Pages,
    /** @deprecated Use `Editor.PageThumbnail` instead. Removed in next major. */
    PageThumb: PageThumbnail,
} as const;

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

export { setReactPackageTracker } from './internal/analytics';
export type { AnalyticsTracker } from './internal/analytics';
