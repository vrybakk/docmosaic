import { jsPDF } from 'jspdf';
import { processImagesForPDF } from './pdf-editor/utils/image';
import { PDFGenerationOptions, PageSize, Section } from './types';

// Define page sizes in points (72 DPI)
const CUSTOM_PAGE_SIZES: Record<PageSize, [number, number]> = {
    // ISO A series
    A0: [2383.94, 3370.39],
    A1: [1683.78, 2383.94],
    A2: [1190.55, 1683.78],
    A3: [841.89, 1190.55],
    A4: [595.28, 841.89],
    A5: [419.53, 595.28],

    // ISO B series
    B4: [708.66, 1000.63],
    B5: [498.9, 708.66],

    // North American sizes
    LETTER: [612.0, 792.0],
    LEGAL: [612.0, 1008.0],
    TABLOID: [792.0, 1224.0],
    EXECUTIVE: [521.86, 756.0],
    STATEMENT: [396.0, 612.0],
    FOLIO: [612.0, 936.0],
};

interface GenerationProgress {
    stage: 'optimizing' | 'generating' | 'complete';
    progress: number;
}

interface GenerationOptions extends PDFGenerationOptions {
    signal?: AbortSignal;
}

/**
 * Estimates the final PDF size based on sections and backgrounds
 */
export function estimatePDFSize(sections: Section[], backgrounds: (string | null)[]): number {
    // Base PDF size
    let estimatedSize = 5 * 1024; // 5KB base

    // Add size for each image section
    sections.forEach((section) => {
        if (section.imageUrl) {
            // Extract base64 data
            const base64Length = section.imageUrl.split(',')[1]?.length || 0;
            // Convert base64 to approximate byte size and add compression estimate
            const imageSize = Math.ceil(((base64Length * 3) / 4) * 0.7); // 0.7 for JPEG compression
            estimatedSize += imageSize;
        }
    });

    // Add size for backgrounds
    backgrounds.forEach((bg) => {
        if (bg) {
            const base64Length = bg.split(',')[1]?.length || 0;
            const bgSize = Math.ceil(((base64Length * 3) / 4) * 0.7);
            estimatedSize += bgSize;
        }
    });

    return estimatedSize;
}

/**
 * Generates a PDF from the given sections and options
 * Handles image optimization and quality control
 */
export async function generatePDF(
    sections: Section[],
    options: GenerationOptions,
    onProgress?: (progress: GenerationProgress) => void,
): Promise<Blob> {
    const { pageSize, orientation, pages, signal } = options;

    try {
        // Process and optimize all images before PDF generation
        onProgress?.({ stage: 'optimizing', progress: 0 });

        // First optimize background PDFs
        const optimizedBackgrounds = await Promise.all(
            pages.map(async (page, index) => {
                if (!page.backgroundPDF) return null;
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                try {
                    const optimizedBg = await processImagesForPDF(
                        [
                            {
                                id: `bg-${index}`,
                                imageUrl: page.backgroundPDF,
                                x: 0,
                                y: 0,
                                width: CUSTOM_PAGE_SIZES[pageSize][0],
                                height: CUSTOM_PAGE_SIZES[pageSize][1],
                                page: index + 1,
                            },
                        ],
                        (progress) => {
                            // Weight background progress as 30% of optimization phase
                            onProgress?.({
                                stage: 'optimizing',
                                progress: Math.round(progress * 0.3),
                            });
                        },
                    );
                    return optimizedBg[0].imageUrl || null;
                } catch (error) {
                    console.error('Error optimizing background:', error);
                    return page.backgroundPDF;
                }
            }),
        );

        if (signal?.aborted) throw new Error('PDF generation cancelled');

        // Then optimize section images
        const optimizedSections = await processImagesForPDF(sections, (progress) => {
            // Weight section progress as 70% of optimization phase
            onProgress?.({
                stage: 'optimizing',
                progress: 30 + Math.round(progress * 0.7),
            });
        });

        if (signal?.aborted) throw new Error('PDF generation cancelled');

        // Create PDF with points as unit and compression
        onProgress?.({ stage: 'generating', progress: 0 });
        const doc = new jsPDF({
            unit: 'pt',
            format: CUSTOM_PAGE_SIZES[pageSize],
            orientation: orientation,
            compress: true,
        });

        // Process each page
        for (let i = 0; i < pages.length; i++) {
            if (signal?.aborted) throw new Error('PDF generation cancelled');

            if (i > 0) {
                doc.addPage(CUSTOM_PAGE_SIZES[pageSize], orientation);
            }

            // Add background if available
            const background = optimizedBackgrounds[i];
            if (background) {
                try {
                    doc.addImage(
                        background,
                        'JPEG',
                        0,
                        0,
                        doc.internal.pageSize.getWidth(),
                        doc.internal.pageSize.getHeight(),
                        `bg-${i}`,
                        'MEDIUM',
                        0,
                    );
                } catch (error) {
                    console.error('Error adding background:', error);
                }
            }

            // Filter and add sections for current page
            const pageSections = optimizedSections.filter((section) => section.page === i + 1);

            // Add each image to the page
            for (const section of pageSections) {
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                if (section.imageUrl) {
                    try {
                        doc.addImage(
                            section.imageUrl,
                            'JPEG',
                            section.x * (72 / 96), // Convert pixels to points (96 DPI to 72 DPI)
                            section.y * (72 / 96),
                            section.width * (72 / 96),
                            section.height * (72 / 96),
                            `img-${section.id}`,
                            'MEDIUM',
                        );
                    } catch (error) {
                        console.error('Error adding image:', error);
                        continue;
                    }
                }
            }

            // Report progress
            const progress = Math.round(((i + 1) / pages.length) * 100);
            onProgress?.({ stage: 'generating', progress });
        }

        if (signal?.aborted) throw new Error('PDF generation cancelled');

        // Generate PDF blob with optimal settings
        const output = doc.output('arraybuffer');
        const blob = new Blob([output], { type: 'application/pdf' });

        onProgress?.({ stage: 'complete', progress: 100 });
        return blob;
    } catch (error) {
        if ((error as Error).message === 'PDF generation cancelled') {
            console.log('PDF generation was cancelled');
        } else {
            console.error('Error in PDF generation:', error);
        }
        throw error;
    }
}
