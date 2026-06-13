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
import { getStrokeOutline } from '../freehand';
import { CUSTOM_PAGE_SIZES } from '../page-sizes';
import type {
    DrawingSection,
    ImageSection,
    PDFGenerationOptions,
    Section,
    ShapeSection,
    TextSection,
} from '../types';
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
                    const bgSection: ImageSection = {
                        id: `bg-${index}`,
                        type: 'image',
                        imageUrl: page.backgroundPDF,
                        x: 0,
                        y: 0,
                        width: CUSTOM_PAGE_SIZES[pageSize][0],
                        height: CUSTOM_PAGE_SIZES[pageSize][1],
                        page: index + 1,
                        zIndex: 0,
                    };
                    const optimizedBg = await processImagesForPDF([bgSection], (progress) => {
                        onProgress?.({
                            stage: 'optimizing',
                            progress: Math.round(progress * 0.3),
                        });
                    });
                    const first = optimizedBg[0] as ImageSection | undefined;
                    return first?.imageUrl || null;
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

            // Draw page-level Page.background (color, then image) before
            // anything else so sections layer on top. Only runs when a
            // background is configured — pages without one skip this branch
            // entirely and the byte-stable image fixture stays unchanged.
            const pageBg = pages[i].background;
            if (pageBg) {
                drawPageBackground(doc, pageBg);
            }

            // Add legacy backgroundPDF if available
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
            //
            // Hidden sections (`section.hidden === true`) are filtered out
            // entirely so they neither contribute to the PDF nor influence
            // the visible stacking order. Fixtures pre-Phase-25 never set
            // `hidden`, so the byte-diff gate stays stable.
            const indexById = new Map(optimizedSections.map((s, idx) => [s.id, idx]));
            const pageSections = optimizedSections
                .filter((section) => section.page === i + 1 && !section.hidden)
                .sort(
                    (a, b) =>
                        (a.zIndex ?? 0) - (b.zIndex ?? 0) ||
                        (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0),
                );
            for (const section of pageSections) {
                if (signal?.aborted) throw new Error('PDF generation cancelled');

                if (section.type === 'image') {
                    if (section.imageUrl) {
                        try {
                            drawImageSection(doc, section);
                        } catch (error) {
                            console.error('Error adding image:', error);
                            continue;
                        }
                    }
                } else if (section.type === 'text') {
                    drawTextSection(doc, section);
                } else if (section.type === 'shape') {
                    drawShapeSection(doc, section);
                } else if (section.type === 'drawing') {
                    drawDrawingSection(doc, section);
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

/**
 * Renders an {@link ImageSection} into the active jsPDF document. When the
 * section carries a {@link ImageCrop}, the crop region (in PDF points, relative
 * to the section box) is mapped onto the section bounds by:
 *
 * 1. Pushing a clip path over the section box so anything outside is discarded.
 * 2. Scaling the source image up so that the crop window maps 1:1 onto the
 *    section, then offsetting it so the crop's top-left aligns with the
 *    section's top-left.
 * 3. Popping the graphics state to restore the previous clip stack.
 *
 * When `crop` is omitted, the section is rendered exactly as the legacy
 * `addImage` call — this preserves the byte-stable image fixture.
 */
function drawImageSection(doc: jsPDF, section: ImageSection): void {
    if (!section.imageUrl) return;
    const { crop } = section;
    if (!crop) {
        // Legacy path: byte-stable with the pre-Phase-17 generator.
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
        return;
    }

    // Crop path. Scale the source image so its crop window fits the section
    // bounds 1:1, then offset the image so the crop's origin lands on the
    // section's origin. Clip to the section box so the parts outside aren't
    // rendered.
    const scaleX = section.width / crop.width;
    const scaleY = section.height / crop.height;
    const drawWidth = section.width * (section.width / crop.width);
    const drawHeight = section.height * (section.height / crop.height);
    const drawX = section.x - crop.x * scaleX;
    const drawY = section.y - crop.y * scaleY;

    doc.saveGraphicsState();
    doc.rect(section.x, section.y, section.width, section.height).clip().discardPath();
    doc.addImage(
        section.imageUrl,
        'JPEG',
        drawX,
        drawY,
        drawWidth,
        drawHeight,
        `img-${section.id}`,
        'SLOW',
    );
    doc.restoreGraphicsState();
}

/**
 * Renders a {@link TextSection} into the active jsPDF document.
 *
 * @remarks
 * - Font family / weight / style are applied via `setFont`. Unknown fonts
 *   fall back to jspdf's `helvetica` family.
 * - Text is auto-width (Figma-style): it is **not** word-wrapped. Lines break
 *   only on explicit `\n`, so the rendered lines match the on-canvas content
 *   exactly and the section box hugs its text.
 * - Alignment uses jspdf's anchor model, anchored to the measured content
 *   width (the widest line) rather than a stored box width: `left` anchors at
 *   `x`, `center` at the content midline, `right` at the content's trailing
 *   edge.
 *
 * Errors are caught and logged so a malformed text section can't abort the
 * whole document — matches the behaviour of the image path above.
 */
function drawTextSection(doc: jsPDF, section: TextSection): void {
    try {
        const fontFamily = section.fontFamily || 'helvetica';
        const fontStyle = computeFontStyle(section.fontWeight, section.fontStyle);
        doc.setFont(fontFamily, fontStyle);
        doc.setFontSize(section.fontSize);
        if (section.color) {
            doc.setTextColor(section.color);
        }

        // Auto-width: break on explicit newlines only (no word-wrap).
        const lines = (section.text ?? '').split('\n');

        const align: 'left' | 'center' | 'right' = section.align ?? 'left';
        // Anchor center/right to the widest measured line so alignment matches
        // the auto-sized canvas box, not the (now content-derived) box width.
        const maxLineWidth = lines.reduce((max, line) => Math.max(max, doc.getTextWidth(line)), 0);
        const textX =
            align === 'center'
                ? section.x + maxLineWidth / 2
                : align === 'right'
                  ? section.x + maxLineWidth
                  : section.x;
        // jspdf draws text from the baseline; offset by one line-height so the
        // first line lands inside the section box rather than above it.
        const lineHeight = section.lineHeight ?? 1.15;
        const baselineY = section.y + section.fontSize * lineHeight;

        doc.text(lines, textX, baselineY, {
            align,
            lineHeightFactor: lineHeight,
        });
    } catch (error) {
        console.error('Error adding text:', error);
    }
}

/**
 * Convert the (weight, style) pair into the jspdf font-style string.
 * jspdf accepts `'normal' | 'bold' | 'italic' | 'bolditalic'`.
 */
function computeFontStyle(
    weight: 'normal' | 'bold' | undefined,
    style: 'normal' | 'italic' | undefined,
): string {
    const bold = weight === 'bold';
    const italic = style === 'italic';
    if (bold && italic) return 'bolditalic';
    if (bold) return 'bold';
    if (italic) return 'italic';
    return 'normal';
}

/**
 * Render a {@link PageBackground} into the active jsPDF document. Paints the
 * color over the full page bounds, then layers the image (when set) on top.
 *
 * Errors are caught so a malformed background can't abort generation —
 * matches the behavior of the section drawers above.
 */
function drawPageBackground(
    doc: jsPDF,
    background: NonNullable<import('../types').Page['background']>,
): void {
    try {
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        if (background.color) {
            doc.setFillColor(background.color);
            doc.rect(0, 0, w, h, 'F');
        }
        if (background.image) {
            doc.addImage(background.image, 'JPEG', 0, 0, w, h, undefined, 'MEDIUM', 0);
        }
    } catch (error) {
        console.error('Error adding page background:', error);
    }
}

/**
 * Render a {@link ShapeSection} into the active jsPDF document. Maps the
 * shape variant onto a jspdf primitive:
 *
 * - `'rect'` → {@link jsPDF.rect} over the section box.
 * - `'circle'` → {@link jsPDF.ellipse} inscribed in the section box.
 * - `'line'` → {@link jsPDF.line} from the top-left to bottom-right corner.
 *
 * Stroke and fill modes are derived from whether `fill` is `'transparent'`
 * (or absent) — stroke-only when transparent, otherwise filled and stroked.
 * Errors are caught so a malformed shape can't abort generation.
 */
function drawShapeSection(doc: jsPDF, section: ShapeSection): void {
    try {
        const stroke = section.stroke ?? '#000';
        const strokeWidth = section.strokeWidth ?? 1;
        const fill = section.fill;
        const hasFill = fill !== undefined && fill !== 'transparent';
        // jspdf doesn't expose a global opacity API on its 2D drawing helpers;
        // we map it onto the stroke/fill mode so transparent shapes render
        // as stroke-only without writing setGState extensions.
        const opacity = section.opacity ?? 1;

        doc.setDrawColor(stroke);
        doc.setLineWidth(strokeWidth);
        if (hasFill && opacity > 0) {
            doc.setFillColor(fill!);
        }
        const drawStyle: 'F' | 'S' | 'FD' = hasFill && opacity > 0 ? 'FD' : 'S';

        if (section.shape === 'rect') {
            doc.rect(section.x, section.y, section.width, section.height, drawStyle);
        } else if (section.shape === 'circle') {
            const cx = section.x + section.width / 2;
            const cy = section.y + section.height / 2;
            const rx = section.width / 2;
            const ry = section.height / 2;
            doc.ellipse(cx, cy, rx, ry, drawStyle);
        } else if (section.shape === 'line') {
            doc.line(section.x, section.y, section.x + section.width, section.y + section.height);
        }
    } catch (error) {
        console.error('Error adding shape:', error);
    }
}

/**
 * Render a {@link DrawingSection} into the active jsPDF document. Each stroke
 * is drawn as a *filled* smooth outline polygon (via {@link getStrokeOutline},
 * the same perfect-freehand engine the canvas uses) so the PDF matches the
 * on-screen ink exactly — a fixed-width stroked polyline can't reproduce the
 * variable width / tapered caps. Outline points are section-local, offset by
 * the section's (x, y) to land in page space so dragging carries the ink.
 *
 * Degenerate strokes (outline < 3 points) are skipped. Errors are caught so a
 * malformed drawing can't abort generation.
 */
function drawDrawingSection(doc: jsPDF, section: DrawingSection): void {
    try {
        for (const stroke of section.strokes) {
            const outline = getStrokeOutline(stroke.points, stroke.weight, true);
            if (outline.length < 3) continue;
            doc.setFillColor(stroke.color);
            const startX = section.x + outline[0][0];
            const startY = section.y + outline[0][1];
            const segments: [number, number][] = [];
            for (let i = 1; i < outline.length; i++) {
                segments.push([
                    outline[i][0] - outline[i - 1][0],
                    outline[i][1] - outline[i - 1][1],
                ]);
            }
            // Fill ('F') the closed outline polygon as relative line segments.
            doc.lines(segments, startX, startY, [1, 1], 'F', true);
        }
    } catch (error) {
        console.error('Error adding drawing:', error);
    }
}
