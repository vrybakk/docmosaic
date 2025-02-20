import { PageOrientation, PageSize } from '../types';

// Define page sizes in points (72 DPI)
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
 * Gets page dimensions in points based on size and orientation
 */
export function getPageDimensionsWithOrientation(
    pageSize: PageSize,
    orientation: PageOrientation,
): { width: number; height: number } {
    const [width, height] = CUSTOM_PAGE_SIZES[pageSize];
    return orientation === 'landscape' ? { width: height, height: width } : { width, height };
}
