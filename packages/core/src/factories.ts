/**
 * Pure factory helpers for creating {@link Document}, {@link Page}, and
 * {@link Section} values. These produce fresh objects with stable defaults
 * and unique ids; they do not mutate inputs.
 *
 * @packageDocumentation
 */

import { v4 as uuidv4 } from 'uuid';
import { normalizeSection } from './types';
import type { Document, Page, Section, ShapeKind } from './types';

/**
 * Create a new empty document with default settings.
 *
 * Initializes the document in A4 portrait with a single empty page.
 *
 * @returns A freshly created {@link Document} ready to be edited.
 *
 * @example
 * ```ts
 * const doc = createDocument();
 * doc.pageSize; // 'A4'
 * doc.pages.length; // 1
 * ```
 */
export function createDocument(seed?: Partial<Document>): Document {
    const INITIAL_DATE = new Date();
    const base: Document = {
        id: uuidv4(),
        name: 'Untitled Document',
        sections: [],
        createdAt: INITIAL_DATE,
        updatedAt: INITIAL_DATE,
        backgroundPDF: null,
        totalPages: 1,
        currentPage: 1,
        estimatedSize: 0,
        pageSize: 'A4',
        orientation: 'portrait',
        pages: [{ id: uuidv4(), sections: [], backgroundPDF: null }],
    };
    if (!seed) return base;
    // Normalize any legacy sections (no `type` field) when loading a seed so
    // the rest of the editor can rely on the discriminated union.
    const sections = seed.sections ? seed.sections.map(normalizeSection) : base.sections;
    return { ...base, ...seed, sections };
}

/**
 * Create a new empty page with a unique id and no background.
 *
 * @returns A freshly created {@link Page}.
 *
 * @example
 * ```ts
 * const page = createPage();
 * page.sections; // []
 * page.backgroundPDF; // null
 * ```
 */
export function createPage(): Page {
    return {
        id: uuidv4(),
        sections: [],
        backgroundPDF: null,
    };
}

/**
 * Options accepted by {@link createSection}.
 */
export interface CreateSectionOptions {
    /** Variant discriminator. Defaults to `'image'`. */
    type?: 'image' | 'text' | 'shape' | 'drawing' | 'frame';
    /**
     * Required when `type === 'shape'`. Picks the primitive — rectangle,
     * ellipse, or diagonal line.
     */
    shape?: ShapeKind;
    /** Initial X coordinate in CSS pixels. Default `50`. */
    x?: number;
    /** Initial Y coordinate in CSS pixels. Default `50`. */
    y?: number;
    /** 1-based page index the section belongs to. Default `1`. */
    page?: number;
}

/**
 * Create a new section with default position and size.
 *
 * @remarks
 * Input `x` and `y` are interpreted as CSS pixels (96 DPI) and converted to
 * PDF points (72 DPI) for storage so that section geometry matches the units
 * used by the PDF generator.
 *
 * The returned section is sized 200×200 points (image/shape/drawing) and
 * carries the variant defaults dictated by `type`:
 *
 * - `'image'` (default) — empty image slot (`imageUrl` left unset).
 * - `'text'` — sized 280×100 (a wide field, not a square block), empty `text`
 *   body, `fontSize: 16`, `color: 'rgb(0,0,0)'`, `align: 'left'`.
 * - `'shape'` — vector primitive picked via `opts.shape` (`'rect'`,
 *   `'circle'`, `'line'`). Defaults: `fill: 'transparent'`, `stroke: '#000'`,
 *   `strokeWidth: 1`, `opacity: 1`.
 *
 * @param opts - Variant + initial position. See {@link CreateSectionOptions}.
 * @returns A freshly created {@link Section} sized 200×200 points.
 *
 * @example
 * ```ts
 * // Image section (legacy default) — 96px → 72pt at 72 DPI
 * const image = createSection({ x: 96, y: 192, page: 2 });
 *
 * // Text section
 * const text = createSection({ type: 'text', page: 1 });
 * text.text; // ''
 * text.fontSize; // 16
 *
 * // Shape section
 * const circle = createSection({ type: 'shape', shape: 'circle', page: 1 });
 * circle.stroke; // '#000'
 * ```
 */
export function createSection(opts: CreateSectionOptions = {}): Section {
    const { type = 'image', x = 50, y = 50, page = 1 } = opts;
    // Convert input pixels to points (72 DPI)
    const pxToPoints = (px: number) => px * (72 / 96);
    const base = {
        id: uuidv4(),
        x: pxToPoints(x),
        y: pxToPoints(y),
        width: 200, // Larger initial size (about 1/3 of A4 width)
        height: 200, // Square aspect ratio initially
        page,
        zIndex: 0,
        hidden: false,
        locked: false,
    };
    if (type === 'text') {
        return {
            ...base,
            // Auto-width text hugs its content: these are just the seed size for
            // the single frame before the first measurement runs (an empty
            // caret line ~one line tall), then the view overwrites them.
            width: 40,
            height: 19,
            type: 'text',
            text: '',
            fontSize: 16,
            color: 'rgb(0,0,0)',
            align: 'left',
        };
    }
    if (type === 'shape') {
        return {
            ...base,
            type: 'shape',
            shape: opts.shape ?? 'rect',
            fill: 'transparent',
            stroke: '#000',
            strokeWidth: 1,
            opacity: 1,
        };
    }
    if (type === 'drawing') {
        return {
            ...base,
            type: 'drawing',
            strokes: [],
        };
    }
    if (type === 'frame') {
        return {
            ...base,
            type: 'frame',
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 1,
        };
    }
    return { ...base, type: 'image' };
}
