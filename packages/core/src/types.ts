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
     * Optional user-given layer name shown in `Editor.LayerList`. When unset,
     * the list derives a label from the section type/content ("Rect 1", the
     * first line of a text body, etc.).
     *
     * @remarks
     * Optional + undefined-as-derived so documents authored before rename
     * existed keep their computed labels until the user renames a layer.
     */
    name?: string;
    /**
     * Render order. Higher values render on top. Ties resolved by array order.
     *
     * @remarks
     * Defaults to `0` so documents authored before this field existed behave
     * identically — they all share the same layer and the original
     * insertion order wins via the array-index tiebreaker.
     */
    zIndex: number;
    /**
     * When `true`, the section is skipped during canvas and PDF rendering.
     * Surfaced through `Editor.LayerList` as a per-row eye toggle.
     *
     * @remarks
     * Optional + undefined-as-false so documents persisted before Phase 25
     * keep their original rendering — only sections explicitly marked
     * hidden disappear.
     */
    hidden?: boolean;
    /**
     * When `true`, the section refuses selection, drag, and resize. The
     * properties panel still reads its values (so callers can inspect a
     * locked section), but every mutating input on the canvas is suppressed.
     *
     * @remarks
     * Per-section guard — independent from the global `Editor.Root`
     * `readOnly` flag, which locks the whole editor. Optional +
     * undefined-as-false for legacy compatibility.
     */
    locked?: boolean;
}

/**
 * Crop region applied to an {@link ImageSection}. Stored in PDF points,
 * inside the section's bounding box: `x`/`y` are the top-left of the visible
 * crop window relative to the section box; `width`/`height` size that window.
 *
 * @remarks
 * When omitted, the full section box renders the image. When present, the
 * renderer "zooms in" on the cropped region by drawing a larger virtual image
 * such that only the crop window lands inside the section bounds — the crop
 * is non-destructive and the original `imageUrl` is preserved.
 */
export interface ImageCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Image-bearing section. `imageUrl`, when present, is a base64 data URL.
 *
 * @remarks
 * `type: 'image'` is the discriminator that distinguishes this from
 * {@link TextSection}. Legacy documents without a `type` field are treated
 * as image sections — see {@link normalizeSection}.
 *
 * `crop` is optional: when set, only the cropped region of the source image
 * is rendered inside the section bounds. The crop coordinates are in PDF
 * points relative to the section box.
 */
export interface ImageSection extends SectionBase {
    type: 'image';
    imageUrl?: string;
    /**
     * Non-destructive crop region applied at render time. Omit for full image.
     * See {@link ImageCrop} for the coordinate model.
     */
    crop?: ImageCrop;
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
    /**
     * Raw text content. By default text is auto-width: it is not word-wrapped
     * and the box hugs the content (line breaks only on explicit `\n`). Once
     * the user drags a side handle, {@link fixedWidth} flips on and the text
     * wraps to `width`. `height` is always derived from the rendered text.
     */
    text: string;
    /**
     * When `true`, `width` is user-set (via a side resize handle) and the text
     * wraps to it; `height` auto-grows. When unset/`false`, the box is
     * auto-width and hugs the content. Optional + undefined-as-auto-width keeps
     * documents authored before resize existed rendering unchanged.
     */
    fixedWidth?: boolean;
    /**
     * When `true`, `height` is user-set (via a top/bottom/corner handle) so the
     * box can be taller than its text. The box never shrinks below the content
     * (text won't clip) and still grows if you type past the set height. When
     * unset/`false`, `height` hugs the content.
     */
    fixedHeight?: boolean;
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
 * Supported shape variants for {@link ShapeSection}.
 *
 * - `rect` — axis-aligned rectangle filling the section box.
 * - `circle` — ellipse inscribed in the section box.
 * - `line` — diagonal stroke from the top-left to the bottom-right corner.
 */
export type ShapeKind = 'rect' | 'circle' | 'line';

/**
 * Shape-bearing section. Renders a primitive vector shape (rect/circle/line)
 * inside the section box. Stroke and fill mirror the SVG/PDF model.
 *
 * @remarks
 * Visual properties have no inline defaults so they can fall back to sensible
 * render-time defaults (transparent fill, 1pt black stroke, full opacity). See
 * {@link createSection} for the factory defaults.
 */
export interface ShapeSection extends SectionBase {
    type: 'shape';
    /** Which primitive to render. */
    shape: ShapeKind;
    /**
     * Fill color — any CSS color string (`rgb()`, `#rrggbb`, named) or
     * `'transparent'` to draw stroke-only. Defaults to `'transparent'`.
     */
    fill?: string;
    /** Stroke color. Defaults to `'#000'`. */
    stroke?: string;
    /** Stroke width in PDF points. Defaults to `1`. */
    strokeWidth?: number;
    /**
     * Opacity multiplier `0`–`1` applied to both fill and stroke. Defaults
     * to `1`.
     */
    opacity?: number;
}

/**
 * A single 2D point in PDF points (72 DPI). Used by {@link Stroke} to model
 * the polyline geometry of a freehand drawing.
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * One freehand stroke — an ordered polyline plus the ink that drew it. Stored
 * inside {@link DrawingSection.strokes}; the PDF generator replays each stroke
 * as a connected sequence of line segments.
 *
 * @remarks
 * Coordinates are PDF points (72 DPI), relative to the page (the same frame
 * the section's own `x`/`y`/`width`/`height` live in). `weight` is a stroke
 * width in PDF points; `color` accepts any CSS color string jspdf understands.
 */
export interface Stroke {
    points: Point[];
    color: string;
    weight: number;
}

/**
 * Freehand-drawing section. Holds an append-only list of {@link Stroke}s
 * captured while the editor is in drawing mode. The section's bounding box
 * frames the drawing surface; the strokes themselves carry the actual geometry.
 *
 * @remarks
 * `type: 'drawing'` is the discriminator that distinguishes this from the
 * other section variants. Strokes are append-only inside a drawing session;
 * the editor's `clearStrokes` action empties the array (an "eraser" of sorts)
 * but there's no per-stroke removal yet.
 */
export interface DrawingSection extends SectionBase {
    type: 'drawing';
    strokes: Stroke[];
}

/**
 * Discriminated union over the supported section variants. Use the `type`
 * field to narrow — for example:
 *
 * ```ts
 * if (section.type === 'text') {
 *   section.text; // string
 * } else if (section.type === 'shape') {
 *   section.shape; // ShapeKind
 * } else if (section.type === 'drawing') {
 *   section.strokes; // Stroke[]
 * } else {
 *   section.imageUrl; // string | undefined
 * }
 * ```
 */
export type Section = ImageSection | TextSection | ShapeSection | DrawingSection;

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
 * Per-page background. Either a solid color (`color`) or an image data URL
 * (`image`); the two are independent. When both are set the color paints first
 * and the image is layered on top.
 */
export interface PageBackground {
    /** CSS color string — `rgb()`, `#rrggbb`, or any value jspdf accepts. */
    color?: string;
    /** Data URL (JPEG/PNG/etc.) painted to fill the page bounds. */
    image?: string;
}

/**
 * Per-page guide lines. Coordinates are in PDF points (72 DPI) — the same
 * frame `Section.x`/`Section.y` live in.
 *
 * @remarks
 * Vertical guides carry x positions; horizontal guides carry y positions.
 * Guides are pure on-canvas alignment helpers: they influence
 * {@link computeSnapTargets}-style snap math in `@docmosaic/react` but are
 * **never** drawn into the rendered PDF.
 */
export interface PageGuides {
    /** X positions (PDF points) of vertical guide lines. */
    vertical: number[];
    /** Y positions (PDF points) of horizontal guide lines. */
    horizontal: number[];
}

/**
 * One page of the document — its sections plus an optional background PDF
 * data URL rendered behind them.
 *
 * @remarks
 * `background` (Phase 14) layers a solid color and/or an arbitrary image
 * data URL behind sections. It's independent from `backgroundPDF`, which is
 * the legacy single-PDF background used by the file-import flow.
 *
 * `guides` (Phase 29) carries optional ruler-dragged alignment lines. They
 * never reach the PDF output — they exist solely for the editor's snap +
 * visual-alignment surface.
 */
export interface Page {
    id: string;
    sections: Section[];
    backgroundPDF: string | null;
    /** Optional color or image rendered behind sections. */
    background?: PageBackground;
    /**
     * Optional user-placed guide lines for this page. Omitted on legacy
     * documents — readers should treat `undefined` as "no guides".
     */
    guides?: PageGuides;
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
