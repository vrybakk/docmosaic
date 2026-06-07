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
 *   <Editor.Header />
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.PageList />
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 */

import { Root } from './primitives/editor-root';
import { Canvas } from './primitives/canvas';
import { CanvasControls } from './primitives/canvas/canvas-controls';
import { Section } from './primitives/section';
import { PageList } from './primitives/page-list';
import { PageThumb } from './primitives/page-list/page-thumb';
import { Toolbar } from './primitives/toolbar';
import { UndoButton } from './primitives/toolbar/undo-button';
import { RedoButton } from './primitives/toolbar/redo-button';
import { PreviewButton } from './primitives/toolbar/preview-button';
import { PrintButton } from './primitives/toolbar/print-button';
import { DownloadButton } from './primitives/toolbar/download-button';
import { AddSectionButton } from './primitives/toolbar/add-section-button';
import { AddTextButton } from './primitives/toolbar/add-text-button';
import { EstimatedSize } from './primitives/toolbar/estimated-size';
import { ProgressOverlay } from './primitives/toolbar/progress-overlay';
import { Header } from './primitives/header';
import { DocumentName } from './primitives/header/document-name';
import { PageSizeSelect } from './primitives/header/page-size-select';
import { OrientationSelect } from './primitives/header/orientation-select';
import { Preview } from './primitives/preview';

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
 * - `Header` (+ `DocumentName`, `PageSizeSelect`, `OrientationSelect`) — top bar.
 * - `Toolbar` (+ `UndoButton`, `RedoButton`, `PreviewButton`, `PrintButton`,
 *   `DownloadButton`, `AddSectionButton`, `EstimatedSize`, `ProgressOverlay`).
 * - `PageList` (+ `PageThumb`) — left sidebar of page thumbnails.
 * - `Canvas` (+ `CanvasControls`, `Section`) — interactive workspace.
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
 *       <Editor.Header />
 *       <Editor.Toolbar />
 *       <Editor.PageList />
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
    Section,
    PageList,
    PageThumb,
    Toolbar,
    UndoButton,
    RedoButton,
    PreviewButton,
    PrintButton,
    DownloadButton,
    AddSectionButton,
    AddTextButton,
    EstimatedSize,
    ProgressOverlay,
    Header,
    DocumentName,
    PageSizeSelect,
    OrientationSelect,
    Preview,
} as const;

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
