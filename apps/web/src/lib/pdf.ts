/**
 * @deprecated Import from `@docmosaic/core` directly. This shim exists so
 * existing `from '@/lib/pdf'` callers keep working during the refactor and
 * adds web-only analytics around the generator. Will be removed in Phase 10.
 */
import { estimatePDFSize, generatePDF as coreGeneratePDF } from '@docmosaic/core';
import type { GenerationOptions, GenerationProgress } from '@docmosaic/core';
import { trackEvent } from './analytics';
import type { Section } from './types';

export { estimatePDFSize };

/**
 * Wraps `@docmosaic/core`'s `generatePDF` to fire the web app's
 * `documentGenerated` analytics event after a successful render. The core
 * generator itself is analytics-free.
 */
export async function generatePDF(
    sections: Section[],
    options: GenerationOptions,
    onProgress?: (progress: GenerationProgress) => void,
): Promise<Blob> {
    const { pageSize, orientation, pages } = options;
    const estimatedSize = estimatePDFSize(
        sections,
        pages.map((page) => page.backgroundPDF),
    );
    const blob = await coreGeneratePDF(sections, options, onProgress);
    const imageCount = sections.filter((section) => section.imageUrl).length;
    trackEvent.documentGenerated({
        totalPages: pages.length,
        totalImages: imageCount,
        averageImagesPerPage: Math.round(imageCount / pages.length),
        format: pageSize,
        orientation,
        fileSize: Math.round(blob.size / 1024),
        estimatedSize: Math.round(estimatedSize / 1024),
    });
    return blob;
}
