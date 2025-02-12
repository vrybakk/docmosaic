import { describe, expect, it } from 'bun:test';
import { v4 as uuidv4 } from 'uuid';
import { generatePDF } from '../pdf';
import { ImageSection, Page, PDFGenerationOptions } from '../types';

describe('PDF Generation', () => {
    const mockImageSection: ImageSection = {
        id: uuidv4(),
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        page: 1,
        imageUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    };

    const mockPage: Page = {
        id: uuidv4(),
        sections: [],
        backgroundPDF: null,
    };

    const mockOptions: PDFGenerationOptions = {
        pageSize: 'A4',
        orientation: 'portrait',
        pages: [mockPage],
    };

    it('should generate a PDF blob', async () => {
        const result = await generatePDF([mockImageSection], mockOptions);
        expect(result).toBeInstanceOf(Blob);
    });

    it('should handle multiple pages', async () => {
        const multiPageOptions: PDFGenerationOptions = {
            ...mockOptions,
            pages: [mockPage, { ...mockPage, id: uuidv4() }],
        };
        const result = await generatePDF([mockImageSection], multiPageOptions);
        expect(result).toBeInstanceOf(Blob);
    });

    it('should handle different page sizes', async () => {
        const pageSizes: PDFGenerationOptions['pageSize'][] = [
            'A4',
            'LETTER',
            'EXECUTIVE',
            'STATEMENT',
            'FOLIO',
        ];

        for (const size of pageSizes) {
            const options: PDFGenerationOptions = {
                ...mockOptions,
                pageSize: size,
            };
            const result = await generatePDF([mockImageSection], options);
            expect(result).toBeInstanceOf(Blob);
        }
    });

    it('should handle both orientations', async () => {
        const orientations: PDFGenerationOptions['orientation'][] = ['portrait', 'landscape'];

        for (const orientation of orientations) {
            const options: PDFGenerationOptions = {
                ...mockOptions,
                orientation,
            };
            const result = await generatePDF([mockImageSection], options);
            expect(result).toBeInstanceOf(Blob);
        }
    });

    it('should handle sections without images', async () => {
        const sectionWithoutImage: ImageSection = {
            ...mockImageSection,
            imageUrl: undefined,
        };
        const result = await generatePDF([sectionWithoutImage], mockOptions);
        expect(result).toBeInstanceOf(Blob);
    });

    it('should handle empty sections array', async () => {
        const result = await generatePDF([], mockOptions);
        expect(result).toBeInstanceOf(Blob);
    });
});
