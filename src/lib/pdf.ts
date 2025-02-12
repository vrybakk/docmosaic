import { jsPDF } from 'jspdf';
import { ImageSection, Page, PageOrientation, PageSize } from './types';

export interface PDFGenerationOptions {
  pageSize: PageSize;
  orientation: PageOrientation;
  pages: Page[];
}

export async function generatePDF(sections: ImageSection[], options: PDFGenerationOptions): Promise<Blob> {
  const { pageSize, orientation, pages } = options;
  const doc = new jsPDF({
    unit: 'px',
    format: pageSize,
    orientation: orientation,
    hotfixes: ['px_scaling'],
  });

  // Process each page
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      doc.addPage(pageSize, orientation);
    }

    // Filter sections for current page
    const pageSections = sections.filter((section) => section.page === i + 1);

    // Add each image to the page
    for (const section of pageSections) {
      if (section.imageUrl) {
        doc.addImage(section.imageUrl, 'PNG', section.x, section.y, section.width, section.height);
      }
    }
  }

  return doc.output('blob');
}
