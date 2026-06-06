/**
 * @packageDocumentation
 * `@docmosaic/react` — UI primitives for the DocMosaic editor.
 *
 * Phase 7f ships the compound-namespace export. Consumers import a single
 * `Editor` namespace and reach for `Editor.Root`, `Editor.Canvas`, etc.
 *
 * ```tsx
 * import { Editor } from '@docmosaic/react';
 *
 * <Editor.Root />
 * ```
 */

import { Root } from './primitives/editor-root';
import { Canvas } from './primitives/canvas';
import { CanvasControls } from './primitives/canvas/canvas-controls';
import { Section } from './primitives/image-section';
import { PageList } from './primitives/page-list';
import { PageThumb } from './primitives/page-list/page-thumb';
import { Toolbar } from './primitives/toolbar';
import { UndoButton } from './primitives/toolbar/undo-button';
import { RedoButton } from './primitives/toolbar/redo-button';
import { PreviewButton } from './primitives/toolbar/preview-button';
import { PrintButton } from './primitives/toolbar/print-button';
import { DownloadButton } from './primitives/toolbar/download-button';
import { AddSectionButton } from './primitives/toolbar/add-section-button';
import { EstimatedSize } from './primitives/toolbar/estimated-size';
import { ProgressOverlay } from './primitives/toolbar/progress-overlay';
import { Header } from './primitives/header';
import { DocumentName } from './primitives/header/document-name';
import { PageSizeSelect } from './primitives/header/page-size-select';
import { OrientationSelect } from './primitives/header/orientation-select';
import { Preview } from './primitives/preview';

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
    EstimatedSize,
    ProgressOverlay,
    Header,
    DocumentName,
    PageSizeSelect,
    OrientationSelect,
    Preview,
} as const;

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

export { useDocumentState } from './hooks/use-document-state';

export { setReactPackageTracker } from './internal/analytics';
export type { AnalyticsTracker } from './internal/analytics';
