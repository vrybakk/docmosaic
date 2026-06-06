/**
 * Standard page size definitions for PDF generation.
 * All dimensions are in PDF points (72 DPI) for direct compatibility with `jsPDF`.
 *
 * @packageDocumentation
 */

import type { PageOrientation, PageSize } from './types';

/**
 * Standard page dimensions in points (72 DPI).
 *
 * @remarks
 * Each entry is `[width, height]` for the **portrait** orientation. Values are
 * derived from the canonical ISO A series (A0–A5), ISO B series (B4–B5), and
 * the standard North American sizes.
 */
export const CUSTOM_PAGE_SIZES: Record<PageSize, [number, number]> = {
    // ISO A series
    A0: [2383.94, 3370.39],
    A1: [1683.78, 2383.94],
    A2: [1190.55, 1683.78],
    A3: [841.89, 1190.55],
    A4: [595.28, 841.89],
    A5: [419.53, 595.28],

    // ISO B series
    B4: [708.66, 1000.63],
    B5: [498.9, 708.66],

    // North American sizes
    LETTER: [612.0, 792.0],
    LEGAL: [612.0, 1008.0],
    TABLOID: [792.0, 1224.0],
    EXECUTIVE: [521.86, 756.0],
    STATEMENT: [396.0, 612.0],
    FOLIO: [612.0, 936.0],
};

/**
 * Returns the page dimensions in points (72 DPI), swapping width and height
 * for landscape orientation.
 *
 * @param pageSize - Standard paper size to look up.
 * @param orientation - `'portrait'` keeps the canonical dimensions; `'landscape'` swaps them.
 * @returns `{ width, height }` in PDF points.
 *
 * @example
 * ```ts
 * getPageDimensionsWithOrientation('A4', 'portrait');
 * // => { width: 595.28, height: 841.89 }
 *
 * getPageDimensionsWithOrientation('A4', 'landscape');
 * // => { width: 841.89, height: 595.28 }
 * ```
 */
export function getPageDimensionsWithOrientation(
    pageSize: PageSize,
    orientation: PageOrientation,
): { width: number; height: number } {
    const [width, height] = CUSTOM_PAGE_SIZES[pageSize];
    return orientation === 'landscape' ? { width: height, height: width } : { width, height };
}
