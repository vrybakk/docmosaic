import { jsPDF } from 'jspdf';
import { ImageSection, Page, PageOrientation, PageSize } from './types';

export interface PDFGenerationOptions {
    pageSize: PageSize;
    orientation: PageOrientation;
    pages: Page[];
}

// Define page sizes in points (72 DPI)
const CUSTOM_PAGE_SIZES = {
    EXECUTIVE: [522, 756], // 7.25" × 10.5"
    STATEMENT: [396, 612], // 5.5" × 8.5"
    FOLIO: [612, 936], // 8.5" × 13"
};

export async function generatePDF(
    sections: ImageSection[],
    options: PDFGenerationOptions,
): Promise<Blob> {
    const { pageSize, orientation, pages } = options;

    // Create PDF with points as unit
    const doc = new jsPDF({
        unit: 'pt',
        format: CUSTOM_PAGE_SIZES[pageSize] || pageSize,
        orientation: orientation,
    });

    try {
        // Process each page
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                doc.addPage(CUSTOM_PAGE_SIZES[pageSize] || pageSize, orientation);
            }

            // Filter sections for current page
            const pageSections = sections.filter((section) => section.page === i + 1);

            // Add each image to the page
            for (const section of pageSections) {
                if (section.imageUrl) {
                    try {
                        doc.addImage(
                            section.imageUrl,
                            'JPEG',
                            section.x,
                            section.y,
                            section.width,
                            section.height,
                        );
                    } catch (error) {
                        console.error('Error adding image:', error);
                        continue;
                    }
                }
            }
        }

        const blob = doc.output('blob');
        if (!(blob instanceof Blob)) {
            throw new Error('Failed to generate PDF blob');
        }
        return blob;
    } catch (error) {
        console.error('Error in PDF generation:', error);
        throw error;
    }
}
