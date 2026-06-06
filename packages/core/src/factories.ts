/**
 * Pure factory helpers for creating {@link Document}, {@link Page}, and
 * {@link Section} values. These produce fresh objects with stable defaults
 * and unique ids; they do not mutate inputs.
 *
 * @packageDocumentation
 */

import { v4 as uuidv4 } from 'uuid';
import type { Document, Page, Section } from './types';

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
export function createDocument(): Document {
    const INITIAL_DATE = new Date();
    return {
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
 * Create a new image section with default position and size.
 *
 * @remarks
 * Input `x` and `y` are interpreted as CSS pixels (96 DPI) and converted to
 * PDF points (72 DPI) for storage so that section geometry matches the units
 * used by the PDF generator.
 *
 * @param x - Initial X coordinate in CSS pixels (default `50`).
 * @param y - Initial Y coordinate in CSS pixels (default `50`).
 * @param page - 1-based page index the section belongs to (default `1`).
 * @returns A freshly created {@link Section} sized 200×200 points.
 *
 * @example
 * ```ts
 * // 96px → 72pt at 72 DPI
 * const section = createSection(96, 192, 2);
 * section.x; // 72
 * section.y; // 144
 * section.page; // 2
 * ```
 */
export function createSection(x: number = 50, y: number = 50, page: number = 1): Section {
    // Convert input pixels to points (72 DPI)
    const pxToPoints = (px: number) => px * (72 / 96);
    return {
        id: uuidv4(),
        x: pxToPoints(x),
        y: pxToPoints(y),
        width: 200, // Larger initial size (about 1/3 of A4 width)
        height: 200, // Square aspect ratio initially
        page,
    };
}
