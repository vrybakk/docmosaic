import { describe, expect, it } from 'vitest';
import { CUSTOM_PAGE_SIZES, getPageDimensionsWithOrientation } from './page-sizes';

describe('getPageDimensionsWithOrientation', () => {
    it('returns portrait A4 with height > width', () => {
        const { width, height } = getPageDimensionsWithOrientation('A4', 'portrait');
        expect(height).toBeGreaterThan(width);
    });

    it('swaps dimensions for landscape A4', () => {
        const portrait = getPageDimensionsWithOrientation('A4', 'portrait');
        const landscape = getPageDimensionsWithOrientation('A4', 'landscape');

        expect(landscape.width).toBe(portrait.height);
        expect(landscape.height).toBe(portrait.width);
        expect(landscape.width).toBeGreaterThan(landscape.height);
    });
});

describe('CUSTOM_PAGE_SIZES', () => {
    it('contains entries with positive width and height', () => {
        const keys = Object.keys(CUSTOM_PAGE_SIZES);
        expect(keys.length).toBeGreaterThan(0);

        for (const key of keys) {
            const [w, h] = CUSTOM_PAGE_SIZES[key as keyof typeof CUSTOM_PAGE_SIZES];
            expect(w).toBeGreaterThan(0);
            expect(h).toBeGreaterThan(0);
        }
    });
});
