import { jsPDF } from 'jspdf';
import { trackEvent } from './analytics';
import { processImagesForPDF } from './pdf-editor/utils/image';
import { PDFGenerationOptions, PageSize, Section } from './types';

// Standard page sizes in points (72 DPI)
const CUSTOM_PAGE_SIZES: Record<PageSize, [number, number]> = {
    A0: [2383.94, 3370.39],
    A1: [1683.78, 2383.94],
    A2: [1190.55, 1683.78],
    A3: [841.89, 1190.55],
    A4: [595.28, 841.89],
    A5: [419.53, 595.28],
    B4: [708.66, 1000.63],
    B5: [498.9, 708.66],
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
 * Estimates final PDF size based on sections and backgrounds
 * Uses base64 length and compression estimates for calculation
 */
export function estimatePDFSize(sections: Section[], backgrounds: (string | null)[]): number {
    let estimatedSize = 5 * 1024; // 5KB base size

    sections.forEach((section) => {
        if (section.type === 'image' && section.imageUrl) {
            const base64Length = section.imageUrl.split(',')[1]?.length || 0;
            const imageSize = Math.ceil(((base64Length * 3) / 4) * 0.7); // 0.7 for JPEG compression
            estimatedSize += imageSize;
        } else if (section.type === 'text' && section.text) {
            // Text sections are much smaller - roughly 1 byte per character
            estimatedSize += section.text.length + 100; // 100 bytes for formatting overhead
        }
    });

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
 * Generates PDF from sections and backgrounds
 * Handles image optimization, quality control, and progress tracking
 */
export async function generatePDF(
    sections: Section[],
    options: GenerationOptions,
    onProgress?: (progress: GenerationProgress) => void,
): Promise<Blob> {
    const { pageSize, orientation, pages, signal } = options;

    // Calculate estimated size before generation
    const estimatedSize = estimatePDFSize(
        sections,
        pages.map((page) => page.backgroundPDF),
    );

    // Collect document statistics
    const documentStats = {
        totalPages: pages.length,
        totalImages: sections.filter((section) => section.type === 'image' && section.imageUrl)
            .length,
        totalTexts: sections.filter((section) => section.type === 'text').length,
        averageImagesPerPage: Math.round(
            sections.filter((section) => section.type === 'image' && section.imageUrl).length /
                pages.length,
        ),
        format: pageSize,
        orientation: orientation,
        fileSize: 0, // Will be updated after generation
        estimatedSize: Math.round(estimatedSize / 1024), // Estimated size in KB
    };

    try {
        onProgress?.({ stage: 'optimizing', progress: 0 });

        // Optimize background PDFs first (30% of optimization phase)
        const optimizedBackgrounds = await Promise.all(
            pages.map(async (page, index) => {
                if (!page.backgroundPDF) return null;
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                try {
                    const optimizedBg = await processImagesForPDF(
                        [
                            {
                                id: `bg-${index}`,
                                type: 'image' as const,
                                imageUrl: page.backgroundPDF,
                                x: 0,
                                y: 0,
                                width: CUSTOM_PAGE_SIZES[pageSize][0],
                                height: CUSTOM_PAGE_SIZES[pageSize][1],
                                page: index + 1,
                            },
                        ],
                        (progress) => {
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

        const imageSections = sections.filter(
            (section) => section.type === 'image' && section.imageUrl,
        );
        const textSections = sections.filter((section) => section.type === 'text');

        // Optimize section images (70% of optimization phase)
        const optimizedImageSections =
            imageSections.length > 0
                ? await processImagesForPDF(imageSections, (progress) => {
                      onProgress?.({
                          stage: 'optimizing',
                          progress: 30 + Math.round(progress * 0.7),
                      });
                  })
                : [];

        // Combine optimized images with text sections
        const optimizedSections = [...optimizedImageSections, ...textSections];

        if (signal?.aborted) throw new Error('PDF generation cancelled');

        // Create PDF with points as unit and compression enabled
        onProgress?.({ stage: 'generating', progress: 0 });
        const doc = new jsPDF({
            unit: 'pt',
            format: CUSTOM_PAGE_SIZES[pageSize],
            orientation: orientation,
            compress: true,
        });

        // Process each page and its contents
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

            // Add sections for current page
            const pageSections = optimizedSections.filter((section) => section.page === i + 1);
            for (const section of pageSections) {
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                if (section.type === 'image' && section.imageUrl) {
                    try {
                        doc.addImage(
                            section.imageUrl,
                            'JPEG',
                            section.x,
                            section.y,
                            section.width,
                            section.height,
                            `img-${section.id}`,
                            'SLOW',
                        );
                    } catch (error) {
                        console.error('Error adding image:', error);
                        continue;
                    }
                } else if (section.type === 'text' && section.text) {
                    try {
                        // Set font properties
                        const fontSize = section.fontSize || 12;
                        const fontFamily = section.fontFamily || 'helvetica';
                        const fontWeight = section.fontWeight || 'normal';
                        const fontStyle = section.fontStyle || 'normal';
                        const textAlign = section.textAlign || 'left';
                        const textColor = section.textColor || '#000000';

                        // Convert hex color to RGB for jsPDF
                        const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result
                                ? {
                                      r: parseInt(result[1], 16),
                                      g: parseInt(result[2], 16),
                                      b: parseInt(result[3], 16),
                                  }
                                : { r: 0, g: 0, b: 0 };
                        };

                        // Set font
                        doc.setFont(fontFamily, fontStyle === 'italic' ? 'italic' : fontWeight);
                        doc.setFontSize(fontSize);

                        // Set text color
                        const rgb = hexToRgb(textColor);
                        doc.setTextColor(rgb.r, rgb.g, rgb.b);

                        // Add background if specified
                        if (section.backgroundColor) {
                            const bgRgb = hexToRgb(section.backgroundColor);
                            doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
                            doc.rect(section.x, section.y, section.width, section.height, 'F');
                        }

                        // Calculate text position based on alignment
                        let textX = section.x;
                        if (textAlign === 'center') {
                            textX = section.x + section.width / 2;
                        } else if (textAlign === 'right') {
                            textX = section.x + section.width;
                        }

                        // Split text into lines that fit within the section width
                        const lines = doc.splitTextToSize(section.text, section.width - 8); // 8pt padding
                        const lineHeight = fontSize + 2;

                        // Calculate starting Y position (center vertically)
                        const totalTextHeight = lines.length * lineHeight;
                        const textY = section.y + (section.height - totalTextHeight) / 2 + fontSize;

                        // Add each line of text
                        lines.forEach((line: string, index: number) => {
                            doc.text(line, textX, textY + index * lineHeight, {
                                align: textAlign as 'left' | 'center' | 'right',
                                maxWidth: section.width - 8,
                            });
                        });
                    } catch (error) {
                        console.error('Error adding text:', error);
                        continue;
                    }
                }
            }

            onProgress?.({
                stage: 'generating',
                progress: Math.round(((i + 1) / pages.length) * 100),
            });
        }

        if (signal?.aborted) throw new Error('PDF generation cancelled');

        const output = doc.output('arraybuffer');
        const blob = new Blob([output], { type: 'application/pdf' });

        // Update file size and track stats
        documentStats.fileSize = Math.round(blob.size / 1024); // Size in KB
        trackEvent.documentGenerated(documentStats);

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
