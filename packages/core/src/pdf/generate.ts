/**
 * PDF generation pipeline. Optimizes section/background images, draws each
 * page with `jspdf`, and returns the resulting `Blob`.
 *
 * Browser-only: depends on `jspdf` plus the DOM-bound image helpers in
 * {@link processImagesForPDF}. The module is importable in Node — the
 * runtime guard fires at call time, not at module load.
 *
 * @packageDocumentation
 */

import { jsPDF } from 'jspdf';
import { CUSTOM_PAGE_SIZES } from '../page-sizes';
import type { PDFGenerationOptions, Section } from '../types';
import { estimatePDFSize } from './estimate';
import { processImagesForPDF } from './optimize-image';

/**
 * Progress payload reported by {@link generatePDF} via its `onProgress` callback.
 */
export interface GenerationProgress {
    stage: 'optimizing' | 'generating' | 'complete';
    /** `0`–`100` within the current stage. */
    progress: number;
}

/**
 * Options accepted by {@link generatePDF}. Extends {@link PDFGenerationOptions}
 * with an optional `AbortSignal` for cancellation.
 */
export interface GenerationOptions extends PDFGenerationOptions {
    /** When aborted, generation throws `Error('PDF generation cancelled')`. */
    signal?: AbortSignal;
}

/**
 * Renders a `Blob` PDF from the document's sections and per-page backgrounds.
 *
 * @remarks
 * Pipeline:
 * 1. Optimize background PDFs (first 30% of the `optimizing` stage).
 * 2. Optimize section images (remaining 70%).
 * 3. Build a `jsPDF` document in points (72 DPI) using `CUSTOM_PAGE_SIZES[pageSize]`.
 * 4. For each page, draw the background then per-page sections.
 *
 * Cancellation is checked at every awaitable step; when `signal.aborted` is
 * true the function throws `Error('PDF generation cancelled')`. Preserve
 * that exact message — callers (e.g. the editor UI) match on it.
 *
 * @param sections - Flat list of sections across all pages.
 * @param options - Page settings + optional `AbortSignal`. See {@link GenerationOptions}.
 * @param onProgress - Optional callback fired on stage transitions and per-page progress.
 * @returns The generated PDF as a `Blob` of type `application/pdf`.
 * @throws {Error} `'PDF generation cancelled'` when the supplied `AbortSignal` aborts.
 * @throws {Error} Any underlying `jspdf` or canvas failure.
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 * const blob = await generatePDF(
 *   document.sections,
 *   {
 *     pageSize: document.pageSize,
 *     orientation: document.orientation,
 *     pages: document.pages,
 *     signal: controller.signal,
 *   },
 *   (progress) => console.log(progress.stage, progress.progress),
 * );
 * ```
 */
export async function generatePDF(
    sections: Section[],
    options: GenerationOptions,
    onProgress?: (progress: GenerationProgress) => void,
): Promise<Blob> {
    const { pageSize, orientation, pages, signal } = options;

    // Calculate estimated size before generation (kept for parity with
    // legacy callers — useful diagnostic when wiring telemetry).
    estimatePDFSize(
        sections,
        pages.map((page) => page.backgroundPDF),
    );

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
                                imageUrl: page.backgroundPDF,
                                x: 0,
                                y: 0,
                                width: CUSTOM_PAGE_SIZES[pageSize][0],
                                height: CUSTOM_PAGE_SIZES[pageSize][1],
                                page: index + 1,
                                zIndex: 0,
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

        // Optimize section images (70% of optimization phase)
        const optimizedSections = await processImagesForPDF(sections, (progress) => {
            onProgress?.({
                stage: 'optimizing',
                progress: 30 + Math.round(progress * 0.7),
            });
        });

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

            // Add sections for current page, sorted by (zIndex asc, array
            // index asc). Lower zIndex draws first (back); ties fall back to
            // the original array order so legacy documents — where every
            // section's zIndex defaults to 0 — keep their insertion-order
            // rendering and the byte-diff fixture stays stable.
            const indexById = new Map(optimizedSections.map((s, idx) => [s.id, idx]));
            const pageSections = optimizedSections
                .filter((section) => section.page === i + 1)
                .sort(
                    (a, b) =>
                        (a.zIndex ?? 0) - (b.zIndex ?? 0) ||
                        (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0),
                );
            for (const section of pageSections) {
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                if (section.imageUrl) {
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
