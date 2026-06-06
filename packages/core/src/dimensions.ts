/**
 * Pure unit-conversion helpers for page dimensions.
 * Storage unit for section geometry is PDF points (72 DPI); these helpers
 * exist for UI display and human-facing dimensions (mm/in/px).
 *
 * @packageDocumentation
 */

import type { MeasurementUnit, PageDimensions, PageSize } from './types';

/**
 * Standard page dimensions in millimeters.
 *
 * @remarks
 * Source of truth for the "human" dimensions of each {@link PageSize}.
 * Use {@link getPageDimensions} to convert these into inches or pixels.
 */
const PAGE_SIZES_MM: Record<PageSize, PageDimensions> = {
    // ISO A Series
    A0: { width: 841, height: 1189 },
    A1: { width: 594, height: 841 },
    A2: { width: 420, height: 594 },
    A3: { width: 297, height: 420 },
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    // ISO B Series
    B4: { width: 250, height: 353 },
    B5: { width: 176, height: 250 },
    // North American sizes
    LETTER: { width: 216, height: 279 },
    LEGAL: { width: 216, height: 356 },
    TABLOID: { width: 279, height: 432 },
    EXECUTIVE: { width: 184, height: 267 },
    STATEMENT: { width: 140, height: 216 },
    FOLIO: { width: 216, height: 330 },
};

/**
 * Human-readable labels for each {@link PageSize}, including dimensions in mm.
 */
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

/**
 * Unit conversion factors. Pixels use the standard CSS 96 DPI.
 */
const CONVERSION = {
    'mm-in': 1 / 25.4,
    'mm-px': 96 / 25.4,
    'in-mm': 25.4,
    'in-px': 96,
    'px-mm': 25.4 / 96,
    'px-in': 1 / 96,
};

/**
 * Converts page dimensions between measurement units.
 *
 * @param dimensions - Width/height to convert.
 * @param fromUnit - Unit of the input dimensions.
 * @param toUnit - Desired output unit.
 * @returns Width/height in the target unit. If `fromUnit === toUnit`, the input is returned unchanged.
 *
 * @example
 * ```ts
 * convertDimensions({ width: 210, height: 297 }, 'mm', 'in');
 * // => { width: 8.2677..., height: 11.6929... }
 * ```
 */
export function convertDimensions(
    dimensions: PageDimensions,
    fromUnit: MeasurementUnit,
    toUnit: MeasurementUnit,
): PageDimensions {
    if (fromUnit === toUnit) return dimensions;

    const conversionKey = `${fromUnit}-${toUnit}` as keyof typeof CONVERSION;
    const factor = CONVERSION[conversionKey];

    return {
        width: dimensions.width * factor,
        height: dimensions.height * factor,
    };
}

/**
 * Returns the canonical dimensions for a {@link PageSize} in the requested unit.
 *
 * @param pageSize - Standard paper size.
 * @param unit - Output unit. Defaults to `'mm'`.
 * @returns Width/height in the requested unit.
 */
export function getPageDimensions(
    pageSize: PageSize,
    unit: MeasurementUnit = 'mm',
): PageDimensions {
    const baseDimensions = PAGE_SIZES_MM[pageSize];
    return unit === 'mm' ? baseDimensions : convertDimensions(baseDimensions, 'mm', unit);
}

/**
 * Formats dimensions for display alongside the unit suffix.
 *
 * @param dimensions - Width/height to format.
 * @param unit - Unit label to append.
 * @returns A string like `"210×297mm"` or `"8.27×11.69in"`.
 *
 * @example
 * ```ts
 * formatDimensions({ width: 210, height: 297 }, 'mm');
 * // => '210×297mm'
 * ```
 */
export function formatDimensions(dimensions: PageDimensions, unit: MeasurementUnit): string {
    const w = Math.round(dimensions.width * 100) / 100;
    const h = Math.round(dimensions.height * 100) / 100;
    return `${w}×${h}${unit}`;
}

/**
 * Converts millimeters to PDF points (72 DPI).
 *
 * @param mm - Length in millimeters.
 * @returns Length in PDF points.
 */
export function mmToPt(mm: number): number {
    return mm * 2.83465;
}

/**
 * Converts PDF points (72 DPI) to millimeters.
 *
 * @param pt - Length in PDF points.
 * @returns Length in millimeters.
 */
export function ptToMm(pt: number): number {
    return pt / 2.83465;
}
