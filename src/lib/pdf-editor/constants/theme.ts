import { CUSTOM_PAGE_SIZES } from '../utils/page-sizes';

// Calculate dimensions in mm for display
const PAGE_DIMENSIONS = Object.entries(CUSTOM_PAGE_SIZES).reduce(
    (acc, [key, [width, height]]) => {
        // Convert points to mm (1 pt = 0.3528 mm)
        const widthMm = Math.round(width * 0.3528);
        const heightMm = Math.round(height * 0.3528);
        acc[key] = `${widthMm} × ${heightMm} mm`;
        return acc;
    },
    {} as Record<string, string>,
);

export const DOCMOSAIC_COLORS = {
    cream: '#FCDE9C',
    purple: '#381D2A',
    sage: '#C4D6B0',
    white: '#FFFFFF',
} as const;

// Sort page sizes by total area (width * height)
export const PAGE_SIZE_OPTIONS = Object.entries(CUSTOM_PAGE_SIZES)
    .sort(([, [w1, h1]], [, [w2, h2]]) => w2 * h2 - w1 * h1)
    .map(([value]) => ({
        value,
        label: value,
        dimensions: PAGE_DIMENSIONS[value],
    }));

export const ORIENTATION_OPTIONS = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
] as const;
