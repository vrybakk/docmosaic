import { jsPDF } from 'jspdf';
import { ImageSection, Page, PageOrientation, PageSize } from '../types';
import { getPageDimensionsWithOrientation } from './page-sizes';

interface ExportOptions {
    pages: Page[];
    sections: ImageSection[];
    pageSize: PageSize;
    orientation: PageOrientation;
}

/**
 * Converts pixels to points
 */
function pxToPt(px: number, dpi: number = 72): number {
    return (px * 72) / dpi;
}

/**
 * Exports the document to PDF
 */
export async function exportToPdf({
    pages,
    sections,
    pageSize,
    orientation,
}: ExportOptions): Promise<Blob> {
    // Create new PDF document
    const doc = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'pt',
        format: pageSize,
    });

    // Get page dimensions in points
    const pageDimensions = getPageDimensionsWithOrientation(pageSize, orientation);

    // Process each page
    for (let pageNumber = 1; pageNumber <= pages.length; pageNumber++) {
        if (pageNumber > 1) {
            doc.addPage();
        }

        const page = pages[pageNumber - 1];

        // Add background PDF if exists
        if (page.backgroundPDF) {
            try {
                await doc.addImage(
                    page.backgroundPDF,
                    'PNG',
                    0,
                    0,
                    pageDimensions.width,
                    pageDimensions.height,
                    undefined,
                    'FAST',
                );
            } catch (error) {
                console.error('Error adding background PDF:', error);
            }
        }

        // Add sections for this page
        const pageSections = sections.filter((section) => section.page === pageNumber);

        for (const section of pageSections) {
            if (!section.imageUrl) continue;

            try {
                // Calculate the exact position and dimensions in points
                const x = pxToPt(section.x);
                const y = pxToPt(section.y);
                const width = pxToPt(section.width);
                const height = pxToPt(section.height);

                // Add image with exact dimensions
                await doc.addImage(section.imageUrl, 'PNG', x, y, width, height, undefined, 'FAST');
            } catch (error) {
                console.error('Error adding section image:', error);
            }
        }
    }

    // Return the PDF as a blob
    return doc.output('blob');
}
