/**
 * @packageDocumentation
 * `@docmosaic/react` — UI primitives for the DocMosaic editor.
 *
 * Phase 7e ships the moved primitives under their original names. The
 * compound-namespace export (Editor.Root, Editor.Canvas, …) lands in
 * Phase 7f.
 */

export { PDFEditor } from './primitives/pdf-editor';
export { Canvas } from './primitives/canvas';
export { ImageSectionComponent as ImageSection } from './primitives/image-section';
export { Sidebar } from './primitives/sidebar';
export { Toolbar } from './primitives/toolbar';
export { Header } from './primitives/header';
export { Preview } from './primitives/preview';
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
