import { describe, expect, it } from 'bun:test';
import {
    convertDimensions,
    getPageDimensions,
    getPageDimensionsWithOrientation,
} from '../page-sizes';
import { PageDimensions } from '../types';

describe('Page Size Calculations', () => {
    describe('getPageDimensions', () => {
        it('should return correct A4 dimensions in millimeters', () => {
            const dimensions = getPageDimensions('A4', 'mm');
            expect(dimensions.width).toBe(210);
            expect(dimensions.height).toBe(297);
            expect(dimensions.unit).toBe('mm');
        });

        it('should return correct Letter dimensions in millimeters', () => {
            const dimensions = getPageDimensions('LETTER', 'mm');
            expect(dimensions.width).toBeCloseTo(215.9, 1);
            expect(dimensions.height).toBeCloseTo(279.4, 1);
            expect(dimensions.unit).toBe('mm');
        });
    });

    describe('convertDimensions', () => {
        const mmDimensions: PageDimensions = {
            width: 210,
            height: 297,
            unit: 'mm',
        };

        it('should convert mm to inches correctly', () => {
            const inDimensions = convertDimensions(mmDimensions, 'in');
            expect(inDimensions.width).toBeCloseTo(8.27, 2);
            expect(inDimensions.height).toBeCloseTo(11.69, 2);
            expect(inDimensions.unit).toBe('in');
        });

        it('should convert mm to pixels correctly', () => {
            const pxDimensions = convertDimensions(mmDimensions, 'px');
            expect(pxDimensions.width).toBeCloseTo(794, 0);
            expect(pxDimensions.height).toBeCloseTo(1123, 0);
            expect(pxDimensions.unit).toBe('px');
        });

        it('should return same dimensions if target unit is the same', () => {
            const sameDimensions = convertDimensions(mmDimensions, 'mm');
            expect(sameDimensions).toEqual(mmDimensions);
        });
    });

    describe('getPageDimensionsWithOrientation', () => {
        it('should return correct dimensions for portrait orientation', () => {
            const dimensions = getPageDimensionsWithOrientation('A4', 'portrait');
            expect(dimensions.width).toBeLessThan(dimensions.height);
        });

        it('should return swapped dimensions for landscape orientation', () => {
            const portrait = getPageDimensionsWithOrientation('A4', 'portrait');
            const landscape = getPageDimensionsWithOrientation('A4', 'landscape');

            expect(landscape.width).toBe(portrait.height);
            expect(landscape.height).toBe(portrait.width);
        });

        it('should handle custom page sizes correctly', () => {
            const sizes: Array<'EXECUTIVE' | 'STATEMENT' | 'FOLIO'> = [
                'EXECUTIVE',
                'STATEMENT',
                'FOLIO',
            ];

            for (const size of sizes) {
                const dimensions = getPageDimensionsWithOrientation(size, 'portrait');
                expect(dimensions.width).toBeGreaterThan(0);
                expect(dimensions.height).toBeGreaterThan(0);
                expect(dimensions.unit).toBe('px');
            }
        });
    });
});
