/**
 * Live PDF size estimation. Used by the editor toolbar to show a projected
 * file size before the user actually renders the document.
 *
 * @packageDocumentation
 */

import type { Section } from '../types';

/**
 * Estimates the final PDF size in bytes from raw section and background payloads.
 *
 * @remarks
 * Pure math over base64 lengths — no PDF library involved. Each base64 image
 * payload is decoded to its approximate binary size and discounted by `0.7`
 * to model JPEG recompression done during real generation. A 5 KB baseline
 * accounts for the empty document overhead.
 *
 * @param sections - Image sections in the document. Sections without `imageUrl` contribute nothing.
 * @param backgrounds - Background data URLs per page; `null` entries are skipped.
 * @returns Approximate final PDF size in bytes.
 *
 * @example
 * ```ts
 * const bytes = estimatePDFSize(document.sections, document.pages.map(p => p.backgroundPDF));
 * const kb = Math.round(bytes / 1024);
 * ```
 */
export function estimatePDFSize(sections: Section[], backgrounds: (string | null)[]): number {
    let estimatedSize = 5 * 1024; // 5KB base size

    sections.forEach((section) => {
        if (section.imageUrl) {
            const base64Length = section.imageUrl.split(',')[1]?.length || 0;
            const imageSize = Math.ceil(((base64Length * 3) / 4) * 0.7); // 0.7 for JPEG compression
            estimatedSize += imageSize;
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
