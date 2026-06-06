/**
 * @packageDocumentation
 * `@docmosaic/core` — framework-agnostic types, constants, and pure helpers
 * shared across the DocMosaic editor and its packages.
 */

// Types
export type {
    DragPosition,
    Document,
    MeasurementUnit,
    Page,
    PageDimensions,
    PageOrientation,
    PageSize,
    PDFGenerationOptions,
    ResizeInfo,
    Section,
} from './types';

import type { Document, Section } from './types';

/**
 * @deprecated Use `Section` instead. Will be removed in Phase 10.
 */
export type ImageSection = Section;

/**
 * @deprecated Use `Document` instead. Will be removed in Phase 10.
 */
export type PDFDocument = Document;

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
