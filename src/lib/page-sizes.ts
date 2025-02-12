import { MeasurementUnit, PageDimensions, PageSize } from './types';

// Base dimensions in millimeters
const PAGE_SIZES_MM: Record<PageSize, PageDimensions> = {
  // ISO A Series
  A3: { width: 297, height: 420, unit: 'mm' },
  A4: { width: 210, height: 297, unit: 'mm' },
  A5: { width: 148, height: 210, unit: 'mm' },
  // ISO B Series
  B4: { width: 250, height: 353, unit: 'mm' },
  B5: { width: 176, height: 250, unit: 'mm' },
  // North American sizes converted to mm for consistency
  LETTER: { width: 215.9, height: 279.4, unit: 'mm' },
  LEGAL: { width: 215.9, height: 355.6, unit: 'mm' },
  TABLOID: { width: 279.4, height: 431.8, unit: 'mm' },
  EXECUTIVE: { width: 184.15, height: 266.7, unit: 'mm' },
  STATEMENT: { width: 139.7, height: 215.9, unit: 'mm' },
  FOLIO: { width: 215.9, height: 330.2, unit: 'mm' },
};

// Labels for UI display
export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  // ISO A Series
  A3: 'A3 (297×420mm)',
  A4: 'A4 (210×297mm)',
  A5: 'A5 (148×210mm)',
  // ISO B Series
  B4: 'B4 (250×353mm)',
  B5: 'B5 (176×250mm)',
  // North American
  LETTER: 'Letter (8.5×11in)',
  LEGAL: 'Legal (8.5×14in)',
  TABLOID: 'Tabloid (11×17in)',
  EXECUTIVE: 'Executive (7.25×10.5in)',
  STATEMENT: 'Statement (5.5×8.5in)',
  FOLIO: 'Folio (8.5×13in)',
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
export function convertDimensions(dimensions: PageDimensions, targetUnit: MeasurementUnit): PageDimensions {
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
export function getPageDimensions(pageSize: PageSize, unit: MeasurementUnit = 'mm'): PageDimensions {
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
