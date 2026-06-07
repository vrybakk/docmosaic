/**
 * @packageDocumentation
 * `@docmosaic/core` — framework-agnostic types, constants, and pure helpers
 * shared across the DocMosaic editor and its packages.
 */

// Types
export type {
    DragPosition,
    Document,
    ImageSection,
    MeasurementUnit,
    Page,
    PageBackground,
    PageDimensions,
    PageOrientation,
    PageSize,
    PDFGenerationOptions,
    ResizeInfo,
    Section,
    SectionBase,
    ShapeKind,
    ShapeSection,
    TextSection,
} from './types';
export { normalizeSection } from './types';

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
export { estimatePDFSize } from './pdf/estimate';
export type { GenerationOptions, GenerationProgress } from './pdf/generate';
export { generatePDF } from './pdf/generate';
export { optimizeImageForPDF, processImagesForPDF } from './pdf/optimize-image';

// Factories
export { createDocument, createPage, createSection } from './factories';
export type { CreateSectionOptions } from './factories';

// Reducer + history
export type { Action, State } from './reducer';
export { reducer } from './reducer';
export type { HistoryAction, HistoryState } from './history';
export { withHistory } from './history';
