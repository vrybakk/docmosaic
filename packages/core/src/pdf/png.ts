/**
 * PNG export pipeline. Renders each {@link Document} page to a PNG `Blob` via
 * 2D canvas. This is a *second* rendering pipeline alongside {@link generatePDF}
 * and is intentionally not expected to be pixel-identical to jspdf's output —
 * just visually equivalent.
 *
 * Browser-only. Uses {@link OffscreenCanvas} when available, falling back to a
 * regular `<canvas>` element. Both code paths produce equivalent PNG bytes.
 *
 * @packageDocumentation
 */

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

/**
 * Progress payload reported by {@link generatePNGs}.
 */
export interface PNGGenerationProgress {
    stage: 'generating' | 'complete';
    /** `0`–`100` overall progress across pages. */
    progress: number;
}

/**
 * Options accepted by {@link generatePNGs}. Mirrors {@link PDFGenerationOptions}
 * with an optional `scale` multiplier (defaults to `2` for retina output).
 */
export interface PNGGenerationOptions extends PDFGenerationOptions {
    /**
     * Pixel-density multiplier. `1` produces 72 DPI PNGs (matching the PDF
     * point size 1:1); the default `2` doubles output for crisper raster.
     */
    scale?: number;
    /** When aborted, generation throws `Error('PNG generation cancelled')`. */
    signal?: AbortSignal;
}

/**
 * Renders one PNG `Blob` per page of the document.
 *
 * @remarks
 * Each page is drawn into a fresh canvas in the order it appears in
 * {@link PDFGenerationOptions.pages}. Sections are drawn in the same
 * (zIndex asc, array-index asc) order used by the PDF generator. Returns an
 * array of {@link Blob}s — one per page — each tagged `image/png`.
 *
 * The render is a 2D canvas approximation: image sections via `drawImage`
 * (with crop applied), text via `fillText`, shapes via path ops, drawings via
 * polyline strokes. PNG output is visually equivalent to the PDF but not
 * pixel-identical — different rasterizers, different font metrics, different
 * compression.
 *
 * @param sections - Flat list of sections across all pages.
 * @param options - Page settings + optional scale + abort signal.
 * @param onProgress - Optional progress callback fired per page.
 * @returns An array of `Blob` values, one per page, all of type `image/png`.
 * @throws {Error} `'PNG generation cancelled'` when the supplied signal aborts.
 *
 * @example
 * ```ts
 * const pngs = await generatePNGs(doc.sections, {
 *   pageSize: doc.pageSize,
 *   orientation: doc.orientation,
 *   pages: doc.pages,
 *   scale: 2,
 * });
 * // Save the first page
 * const url = URL.createObjectURL(pngs[0]);
 * ```
 */
export async function generatePNGs(
    sections: Section[],
    options: PNGGenerationOptions,
    onProgress?: (progress: PNGGenerationProgress) => void,
): Promise<Blob[]> {
    const { pageSize, orientation, pages, scale = 2, signal } = options;
    const [pageWidthPt, pageHeightPt] = CUSTOM_PAGE_SIZES[pageSize];
    const [w, h] =
        orientation === 'landscape' ? [pageHeightPt, pageWidthPt] : [pageWidthPt, pageHeightPt];

    const blobs: Blob[] = [];
    onProgress?.({ stage: 'generating', progress: 0 });

    for (let i = 0; i < pages.length; i++) {
        if (signal?.aborted) throw new Error('PNG generation cancelled');

        const { canvas, ctx } = createCanvas(w * scale, h * scale);
        ctx.scale(scale, scale);

        // Page background — white by default so partial-coverage pages don't
        // surface a transparent void. Then optional Page.background color +
        // image layered on top, mirroring the PDF renderer's order.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        const pageBg = pages[i].background;
        if (pageBg?.color) {
            ctx.fillStyle = pageBg.color;
            ctx.fillRect(0, 0, w, h);
        }
        if (pageBg?.image) {
            await drawImageDataUrl(ctx, pageBg.image, 0, 0, w, h);
        }
        if (pages[i].backgroundPDF) {
            // Background PDFs are pre-rasterized to an image data URL in the
            // editor; treat them like a regular image.
            await drawImageDataUrl(ctx, pages[i].backgroundPDF!, 0, 0, w, h);
        }

        // Sort sections deterministically — same rule as generate.ts so the
        // PNG layer order matches the PDF.
        const indexById = new Map(sections.map((s, idx) => [s.id, idx]));
        const pageSections = sections
            .filter((s) => s.page === i + 1)
            .sort(
                (a, b) =>
                    (a.zIndex ?? 0) - (b.zIndex ?? 0) ||
                    (indexById.get(a.id) ?? 0) - (indexById.get(b.id) ?? 0),
            );

        for (const section of pageSections) {
            if (signal?.aborted) throw new Error('PNG generation cancelled');
            if (section.type === 'image') {
                await drawImageSection(ctx, section);
            } else if (section.type === 'text') {
                drawTextSection(ctx, section);
            } else if (section.type === 'shape') {
                drawShapeSection(ctx, section);
            } else if (section.type === 'drawing') {
                drawDrawingSection(ctx, section);
            }
        }

        const blob = await canvasToBlob(canvas);
        blobs.push(blob);

        onProgress?.({
            stage: 'generating',
            progress: Math.round(((i + 1) / pages.length) * 100),
        });
    }

    onProgress?.({ stage: 'complete', progress: 100 });
    return blobs;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type AnyCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function createCanvas(width: number, height: number): { canvas: AnyCanvas; ctx: AnyCtx } {
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to acquire OffscreenCanvas 2D context');
        return { canvas, ctx: ctx as AnyCtx };
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire canvas 2D context');
    return { canvas, ctx };
}

async function canvasToBlob(canvas: AnyCanvas): Promise<Blob> {
    if ('convertToBlob' in canvas) {
        return canvas.convertToBlob({ type: 'image/png' });
    }
    return new Promise<Blob>((resolve, reject) => {
        (canvas as HTMLCanvasElement).toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('canvas.toBlob returned null'));
        }, 'image/png');
    });
}

async function drawImageDataUrl(
    ctx: AnyCtx,
    src: string,
    x: number,
    y: number,
    width: number,
    height: number,
): Promise<void> {
    const img = await loadImage(src);
    ctx.drawImage(img, x, y, width, height);
}

async function drawImageSection(ctx: AnyCtx, section: ImageSection): Promise<void> {
    if (!section.imageUrl) return;
    const img = await loadImage(section.imageUrl);
    if (section.crop) {
        // Convert section-coord crop window into source-image pixel coords. The
        // crop is expressed in PDF points relative to the section box; the
        // source pixels map 1:1 onto the section box when no crop is set, so
        // the scale is `imgPixels / sectionPts`.
        const sx = (section.crop.x / section.width) * imageWidth(img);
        const sy = (section.crop.y / section.height) * imageHeight(img);
        const sw = (section.crop.width / section.width) * imageWidth(img);
        const sh = (section.crop.height / section.height) * imageHeight(img);
        ctx.drawImage(img, sx, sy, sw, sh, section.x, section.y, section.width, section.height);
    } else {
        ctx.drawImage(img, section.x, section.y, section.width, section.height);
    }
}

function imageWidth(img: HTMLImageElement | ImageBitmap): number {
    return 'naturalWidth' in img ? img.naturalWidth || img.width : img.width;
}

function imageHeight(img: HTMLImageElement | ImageBitmap): number {
    return 'naturalHeight' in img ? img.naturalHeight || img.height : img.height;
}

async function loadImage(src: string): Promise<HTMLImageElement | ImageBitmap> {
    // Prefer `createImageBitmap` when available — it works inside Workers and
    // off-thread contexts (and inside OffscreenCanvas-only environments).
    if (typeof createImageBitmap !== 'undefined' && typeof fetch !== 'undefined') {
        try {
            const res = await fetch(src);
            const blob = await res.blob();
            return await createImageBitmap(blob);
        } catch {
            // Fall through to <img> below.
        }
    }
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

function drawTextSection(ctx: AnyCtx, section: TextSection): void {
    const fontFamily = section.fontFamily || 'helvetica';
    const fontStyle = section.fontStyle === 'italic' ? 'italic' : 'normal';
    const fontWeight = section.fontWeight === 'bold' ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${section.fontSize}px ${fontFamily}`;
    ctx.fillStyle = section.color ?? 'rgb(0,0,0)';
    ctx.textBaseline = 'top';
    const align: 'left' | 'center' | 'right' = section.align ?? 'left';
    ctx.textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';
    const lineHeight = section.lineHeight ?? 1.15;
    const lineHeightPx = section.fontSize * lineHeight;
    const textX =
        align === 'center'
            ? section.x + section.width / 2
            : align === 'right'
              ? section.x + section.width
              : section.x;

    const lines = wrapText(ctx, section.text ?? '', section.width);
    let y = section.y;
    for (const line of lines) {
        ctx.fillText(line, textX, y, section.width);
        y += lineHeightPx;
    }
}

function wrapText(ctx: AnyCtx, text: string, maxWidth: number): string[] {
    if (!text) return [''];
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
        const words = paragraph.split(/\s+/);
        let current = '';
        for (const word of words) {
            const next = current ? `${current} ${word}` : word;
            if (ctx.measureText(next).width > maxWidth && current) {
                lines.push(current);
                current = word;
            } else {
                current = next;
            }
        }
        lines.push(current);
    }
    return lines;
}

function drawShapeSection(ctx: AnyCtx, section: ShapeSection): void {
    const stroke = section.stroke ?? '#000';
    const strokeWidth = section.strokeWidth ?? 1;
    const fill = section.fill;
    const hasFill = fill !== undefined && fill !== 'transparent';
    const opacity = section.opacity ?? 1;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    if (hasFill) ctx.fillStyle = fill!;

    if (section.shape === 'rect') {
        if (hasFill) ctx.fillRect(section.x, section.y, section.width, section.height);
        ctx.strokeRect(section.x, section.y, section.width, section.height);
    } else if (section.shape === 'circle') {
        const cx = section.x + section.width / 2;
        const cy = section.y + section.height / 2;
        const rx = section.width / 2;
        const ry = section.height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (hasFill) ctx.fill();
        ctx.stroke();
    } else if (section.shape === 'line') {
        ctx.beginPath();
        ctx.moveTo(section.x, section.y);
        ctx.lineTo(section.x + section.width, section.y + section.height);
        ctx.stroke();
    }
    ctx.restore();
}

function drawDrawingSection(ctx: AnyCtx, section: DrawingSection): void {
    for (const stroke of section.strokes) {
        // Fill the smooth perfect-freehand outline polygon (same engine as the
        // canvas + PDF) so PNG stays visually equivalent. Points are
        // section-local; offset by (section.x, section.y).
        const outline = getStrokeOutline(stroke.points, stroke.weight, true);
        if (outline.length < 3) continue;
        ctx.save();
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.moveTo(section.x + outline[0][0], section.y + outline[0][1]);
        for (let i = 1; i < outline.length; i++) {
            ctx.lineTo(section.x + outline[i][0], section.y + outline[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
