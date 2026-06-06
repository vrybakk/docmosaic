/**
 * Domain types for the DocMosaic editor. All geometry values are stored in
 * PDF points (72 DPI) unless explicitly marked otherwise.
 *
 * @packageDocumentation
 */

/**
 * Supported page sizes for generated PDFs.
 *
 * @remarks
 * Covers the ISO A series (A0–A5), ISO B series (B4–B5), and the standard
 * North American sizes used by `jsPDF`.
 */
export type PageSize =
    | 'A0'
    | 'A1'
    | 'A2'
    | 'A3'
    | 'A4'
    | 'A5'
    | 'B4'
    | 'B5'
    | 'LETTER'
    | 'LEGAL'
    | 'TABLOID'
    | 'EXECUTIVE'
    | 'STATEMENT'
    | 'FOLIO';

/**
 * Page orientation for the document.
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Measurement unit used by the dimension conversion helpers.
 *
 * @remarks
 * - `mm` — millimeters
 * - `in` — inches
 * - `px` — CSS pixels (96 DPI)
 *
 * PDF points (72 DPI) are the canonical storage unit for section geometry
 * and are intentionally not part of this enum.
 */
export type MeasurementUnit = 'mm' | 'in' | 'px';

/**
 * Width/height pair in a single unit. The unit is tracked separately by
 * the caller — see {@link MeasurementUnit} and the conversion helpers in
 * `@docmosaic/core/dimensions`.
 */
export interface PageDimensions {
    width: number;
    height: number;
}

/**
 * A single image-bearing rectangle on a page. Coordinates and size are in
 * PDF points (72 DPI). `imageUrl`, when present, is a base64 data URL.
 */
export interface Section {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    imageUrl?: string;
}

/**
 * One page of the document — its sections plus an optional background PDF
 * data URL rendered behind them.
 */
export interface Page {
    id: string;
    sections: Section[];
    backgroundPDF: string | null;
}

/**
 * Full document state. `sections` is the flat list across all pages and is
 * the source of truth for rendering; `pages` carries per-page metadata
 * (id + background).
 */
export interface Document {
    id: string;
    name: string;
    sections: Section[];
    createdAt: Date;
    updatedAt: Date;
    backgroundPDF: string | null;
    totalPages: number;
    currentPage: number;
    estimatedSize: number;
    pageSize: PageSize;
    orientation: PageOrientation;
    pages: Page[];
}

/**
 * Pointer position used while dragging a section.
 */
export interface DragPosition {
    x: number;
    y: number;
}

/**
 * Resize state captured at the start of a resize gesture.
 */
export interface ResizeInfo {
    id: string;
    handle: 'right' | 'bottom' | 'bottomRight';
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
}

/**
 * Options accepted by the PDF generator.
 */
export interface PDFGenerationOptions {
    pageSize: PageSize;
    orientation: PageOrientation;
    pages: Page[];
    preview?: boolean;
}
