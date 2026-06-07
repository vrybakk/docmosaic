/**
 * Image optimization helpers used by the PDF generator. These run **only in
 * the browser** — they depend on `HTMLImageElement` and `HTMLCanvasElement`
 * to decode, resize, and re-encode images.
 *
 * The module is safe to *import* in Node (e.g. for type-only imports or to
 * pull in the estimate path alongside it). The browser-only guard fires at
 * call time, not at module load.
 *
 * @packageDocumentation
 */

import type { Section } from '../types';

const BROWSER_ONLY_ERROR =
    '@docmosaic/core PDF image optimization requires a browser environment.';

/**
 * Options accepted by {@link optimizeImageForPDF}.
 */
interface OptimizeImageOptions {
    /** Maximum width in pixels. Defaults to `2000`. */
    maxWidth?: number;
    /** Maximum height in pixels. Defaults to `2000`. */
    maxHeight?: number;
    /** JPEG quality, `0`–`1`. Defaults to `0.85`. */
    quality?: number;
    /** Target resolution for PDF. Reserved for future use. */
    targetDPI?: number;
}

/**
 * Optimizes a single image data URL for PDF inclusion.
 *
 * @remarks
 * - Resizes images larger than `maxWidth`/`maxHeight` while preserving aspect ratio.
 * - Re-encodes to JPEG at the requested `quality`.
 * - Uses a canvas with high-quality smoothing for the resample.
 *
 * Browser-only: throws synchronously when no `window`/`document` is available.
 *
 * @param imageUrl - Source image (typically a base64 data URL).
 * @param options - Resize/quality knobs. See {@link OptimizeImageOptions}.
 * @returns A new JPEG data URL.
 * @throws {Error} When called outside a browser, or when a `2d` canvas context cannot be acquired.
 *
 * @example
 * ```ts
 * const optimized = await optimizeImageForPDF(section.imageUrl, {
 *   maxWidth: section.width * 2,
 *   maxHeight: section.height * 2,
 *   quality: 0.85,
 * });
 * ```
 */
export async function optimizeImageForPDF(
    imageUrl: string,
    options: OptimizeImageOptions = {},
): Promise<string> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error(BROWSER_ONLY_ERROR);
    }

    const {
        maxWidth = 2000,
        maxHeight = 2000,
        quality = 0.85,
    } = options;

    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
    });

    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    const canvas = globalThis.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Batch-optimizes the image payload on a list of sections.
 *
 * @remarks
 * - Each section's `imageUrl` (if present) is run through {@link optimizeImageForPDF}
 *   with a `2x` of the on-page size cap for retina-quality output.
 * - Sections without an image pass through unchanged.
 * - If a single image fails to optimize, the original section is preserved
 *   so generation can still proceed.
 *
 * Browser-only: throws synchronously when no `window`/`document` is available.
 *
 * @param sections - Sections to process. Original references are not mutated.
 * @param onProgress - Optional progress callback, `0`–`100`.
 * @returns A new array of sections with optimized `imageUrl`s where possible.
 * @throws {Error} When called outside a browser.
 *
 * @example
 * ```ts
 * const optimized = await processImagesForPDF(document.sections, (p) => {
 *   console.log(`optimizing: ${p}%`);
 * });
 * ```
 */
export async function processImagesForPDF(
    sections: Section[],
    onProgress?: (progress: number) => void,
): Promise<Section[]> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error(BROWSER_ONLY_ERROR);
    }

    const sectionsWithImages = sections.filter(
        (section) => section.type === 'image' && section.imageUrl,
    );
    const totalImages = sectionsWithImages.length;
    let processedImages = 0;

    const processedSections = await Promise.all(
        sections.map(async (section) => {
            if (section.type !== 'image' || !section.imageUrl) return section;

            try {
                const optimizedImageUrl = await optimizeImageForPDF(section.imageUrl, {
                    maxWidth: Math.ceil(section.width * 2),
                    maxHeight: Math.ceil(section.height * 2),
                    quality: 0.85,
                });

                processedImages++;
                onProgress?.(Math.round((processedImages / totalImages) * 100));

                return {
                    ...section,
                    imageUrl: optimizedImageUrl,
                };
            } catch (error) {
                console.error('Error optimizing image:', error);
                processedImages++;
                onProgress?.(Math.round((processedImages / totalImages) * 100));
                return section;
            }
        }),
    );

    return processedSections;
}
