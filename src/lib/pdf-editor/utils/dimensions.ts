import { MeasurementUnit, PageDimensions, PageOrientation, PageSize } from '../../types';
import { CUSTOM_PAGE_SIZES } from './page-sizes';

// Base dimensions in millimeters
const PAGE_SIZES_MM: Record<PageSize, PageDimensions> = {
    // ISO A Series
    A0: { width: 841, height: 1189, unit: 'mm' },
    A1: { width: 594, height: 841, unit: 'mm' },
    A2: { width: 420, height: 594, unit: 'mm' },
    A3: { width: 297, height: 420, unit: 'mm' },
    A4: { width: 210, height: 297, unit: 'mm' },
    A5: { width: 148, height: 210, unit: 'mm' },
    // ISO B Series
    B4: { width: 250, height: 353, unit: 'mm' },
    B5: { width: 176, height: 250, unit: 'mm' },
    // North American sizes converted to mm for consistency
    LETTER: { width: 216, height: 279, unit: 'mm' },
    LEGAL: { width: 216, height: 356, unit: 'mm' },
    TABLOID: { width: 279, height: 432, unit: 'mm' },
    EXECUTIVE: { width: 184, height: 267, unit: 'mm' },
    STATEMENT: { width: 140, height: 216, unit: 'mm' },
    FOLIO: { width: 216, height: 330, unit: 'mm' },
};

// Labels for UI display
export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
    // ISO A Series
    A0: 'A0 (841×1189mm)',
    A1: 'A1 (594×841mm)',
    A2: 'A2 (420×594mm)',
    A3: 'A3 (297×420mm)',
    A4: 'A4 (210×297mm)',
    A5: 'A5 (148×210mm)',
    // ISO B Series
    B4: 'B4 (250×353mm)',
    B5: 'B5 (176×250mm)',
    // North American
    LETTER: 'Letter (216×279mm)',
    LEGAL: 'Legal (216×356mm)',
    TABLOID: 'Tabloid (279×432mm)',
    EXECUTIVE: 'Executive (184×267mm)',
    STATEMENT: 'Statement (140×216mm)',
    FOLIO: 'Folio (216×330mm)',
};

// Conversion factors
const CONVERSION = {
    'mm-in': 1 / 25.4,
    'mm-px': 96 / 25.4, // 96 DPI
    'in-mm': 25.4,
    'in-px': 96,
    'px-mm': 25.4 / 96,
    'px-in': 1 / 96,
};

/**
 * Convert dimensions between different units
 */
export function convertDimensions(
    dimensions: PageDimensions,
    targetUnit: MeasurementUnit,
): PageDimensions {
    if (dimensions.unit === targetUnit) {
        return dimensions;
    }

    const conversionKey = `${dimensions.unit}-${targetUnit}` as keyof typeof CONVERSION;
    const factor = CONVERSION[conversionKey];

    return {
        width: dimensions.width * factor,
        height: dimensions.height * factor,
        unit: targetUnit,
    };
}

/**
 * Get page dimensions in the desired unit
 */
export function getPageDimensions(
    pageSize: PageSize,
    unit: MeasurementUnit = 'mm',
): PageDimensions {
    const baseDimensions = PAGE_SIZES_MM[pageSize];
    return unit === 'mm' ? baseDimensions : convertDimensions(baseDimensions, unit);
}

/**
 * Format dimensions for display
 */
export function formatDimensions(dimensions: PageDimensions): string {
    const w = Math.round(dimensions.width * 100) / 100;
    const h = Math.round(dimensions.height * 100) / 100;
    return `${w}×${h}${dimensions.unit}`;
}

/**
 * Gets page dimensions in points based on size and orientation
 */
export function getPageDimensionsWithOrientation(
    pageSize: PageSize,
    orientation: PageOrientation,
): { width: number; height: number } {
    const [width, height] = CUSTOM_PAGE_SIZES[pageSize]; // This already returns points
    return orientation === 'landscape' ? { width: height, height: width } : { width, height };
}

/**
 * Converts millimeters to points (72 DPI)
 */
export function mmToPt(mm: number): number {
    return mm * 2.83465; // 1 mm = 2.83465 pt
}

/**
 * Converts points to millimeters
 */
export function ptToMm(pt: number): number {
    return pt / 2.83465; // 1 pt = 0.3528 mm
}
