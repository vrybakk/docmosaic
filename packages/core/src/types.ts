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
 * Geometry + identity shared by every section variant. Coordinates and size
 * are in PDF points (72 DPI). The {@link Section} discriminated union extends
 * this with a `type` tag and per-variant payload.
 */
export interface SectionBase {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    /**
     * Render order. Higher values render on top. Ties resolved by array order.
     *
     * @remarks
     * Defaults to `0` so documents authored before this field existed behave
     * identically — they all share the same layer and the original
     * insertion order wins via the array-index tiebreaker.
     */
    zIndex: number;
}

/**
 * Image-bearing section. `imageUrl`, when present, is a base64 data URL.
 *
 * @remarks
 * `type: 'image'` is the discriminator that distinguishes this from
 * {@link TextSection}. Legacy documents without a `type` field are treated
 * as image sections — see {@link normalizeSection}.
 */
export interface ImageSection extends SectionBase {
    type: 'image';
    imageUrl?: string;
}

/**
 * Text-bearing section. The body lives in `text`; visual presentation comes
 * from the optional typography fields.
 *
 * @remarks
 * Fields with no inline default are left unset so they can fall back to
 * sensible PDF / canvas defaults at render time (system font, black ink, etc.).
 */
export interface TextSection extends SectionBase {
    type: 'text';
    /** Raw text content. Multi-line strings are wrapped to `width` at render time. */
    text: string;
    /** CSS / PDF font family. Falls back to `helvetica` when unset. */
    fontFamily?: string;
    /** Font size in PDF points. */
    fontSize: number;
    /** Bold or normal weight. Defaults to `'normal'`. */
    fontWeight?: 'normal' | 'bold';
    /** Italic or normal slant. Defaults to `'normal'`. */
    fontStyle?: 'normal' | 'italic';
    /** Ink color — any CSS color string. Defaults to `'rgb(0,0,0)'`. */
    color?: string;
    /** Horizontal alignment within the section box. Defaults to `'left'`. */
    align?: 'left' | 'center' | 'right';
    /** Line height multiplier. Defaults to jspdf's built-in spacing when unset. */
    lineHeight?: number;
}

/**
 * Discriminated union over the supported section variants. Use the `type`
 * field to narrow — for example:
 *
 * ```ts
 * if (section.type === 'text') {
 *   section.text; // string
 * } else {
 *   section.imageUrl; // string | undefined
 * }
 * ```
 */
export type Section = ImageSection | TextSection;

/**
 * Normalize a possibly-legacy section value. Sections persisted before the
 * discriminated-union refactor have no `type` field — they're all image
 * sections, so this helper stamps `type: 'image'` when missing.
 *
 * @remarks
 * Pure and idempotent. Safe to run on every load; sections that already
 * carry a `type` are returned untouched.
 *
 * @example
 * ```ts
 * const legacy = { id: 'a', x: 0, y: 0, width: 100, height: 100, page: 1, zIndex: 0 };
 * normalizeSection(legacy as Section); // → { ..., type: 'image' }
 * ```
 */
export function normalizeSection(section: Section): Section {
    // Treat the lack of a discriminator as the legacy image default.
    if ((section as { type?: string }).type === undefined) {
        return { ...(section as ImageSection), type: 'image' };
    }
    return section;
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
