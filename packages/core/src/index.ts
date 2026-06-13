/**
 * @packageDocumentation
 * `@docmosaic/core` — framework-agnostic types, constants, and pure helpers
 * shared across the DocMosaic editor and its packages.
 */

// Types
export type {
    DragPosition,
    Document,
    DrawingSection,
    FrameSection,
    ImageCrop,
    ImageSection,
    MeasurementUnit,
    Page,
    PageBackground,
    PageDimensions,
    PageGuides,
    PageOrientation,
    PageSize,
    PDFGenerationOptions,
    Point,
    ResizeInfo,
    Section,
    SectionBase,
    ShapeKind,
    ShapeSection,
    Stroke,
    TextSection,
} from './types';
export { normalizeSection } from './types';

// ----- Container frames ------------------------------------------------------
export { resolveFrameParent } from './frames';

// Page sizes
export { CUSTOM_PAGE_SIZES, getPageDimensionsWithOrientation } from './page-sizes';

// Dimension helpers
export {
    PAGE_SIZE_LABELS,
    convertDimensions,
    formatDimensions,
    getPageDimensions,
    mmToPt,
    ptToMm,
} from './dimensions';

// PDF helpers
export { getStrokeOutline } from './freehand';
export { estimatePDFSize } from './pdf/estimate';
export type { GenerationOptions, GenerationProgress } from './pdf/generate';
export { generatePDF } from './pdf/generate';
export { optimizeImageForPDF, processImagesForPDF } from './pdf/optimize-image';
export type { PNGGenerationOptions, PNGGenerationProgress } from './pdf/png';
export { generatePNGs } from './pdf/png';

// Templates
export type { DocumentTemplate } from './templates';
export { exportTemplate, importTemplate } from './templates';

// Factories
export { createDocument, createPage, createSection } from './factories';
export type { CreateSectionOptions } from './factories';

// Reducer + history
export type { Action, State } from './reducer';
export { reducer } from './reducer';
export type { HistoryAction, HistoryState } from './history';
export { withHistory } from './history';
