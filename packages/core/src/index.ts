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

// Factories
export { createDocument, createPage, createSection } from './factories';

// Reducer + history
export type { Action, State } from './reducer';
export { reducer } from './reducer';
export type { HistoryAction, HistoryState } from './history';
export { withHistory } from './history';

/** @deprecated Use `createDocument` instead. Will be removed in Phase 10. */
export { createDocument as createInitialDocument } from './factories';
/** @deprecated Use `createSection` instead. Will be removed in Phase 10. */
export { createSection as createNewImageSection } from './factories';
/** @deprecated Use `createPage` instead. Will be removed in Phase 10. */
export { createPage as createNewPage } from './factories';
