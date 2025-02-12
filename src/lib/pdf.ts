import { jsPDF } from 'jspdf';
import { ImageSection, PDFGenerationOptions, PageSize } from './types';

// Define page sizes in points (72 DPI)
const CUSTOM_PAGE_SIZES: Record<PageSize, [number, number]> = {
    A3: [841.89, 1190.55],
    A4: [595.28, 841.89],
    A5: [419.53, 595.28],
    B4: [708.66, 1000.63],
    B5: [498.9, 708.66],
    LETTER: [612, 792],
    LEGAL: [612, 1008],
    TABLOID: [792, 1224],
    EXECUTIVE: [522, 756],
    STATEMENT: [396, 612],
    FOLIO: [612, 936],
};

export async function generatePDF(
    sections: ImageSection[],
    options: PDFGenerationOptions,
): Promise<Blob> {
    const { pageSize, orientation, pages } = options;

    // Create PDF with points as unit
    const doc = new jsPDF({
        unit: 'pt',
        format: CUSTOM_PAGE_SIZES[pageSize],
        orientation: orientation,
    });

    try {
        // Process each page
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                doc.addPage(CUSTOM_PAGE_SIZES[pageSize], orientation);
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
