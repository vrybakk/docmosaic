/**
 * Shared sample documents used across stories. Keep these small and pure so
 * argTypes/controls don't need to recreate state on every render.
 */

import { createDocument, createPage, createSection } from '@docmosaic/core';
import type { Document, ImageSection, TextSection } from '@docmosaic/core';

/**
 * Tiny transparent PNG used to fill section.imageData in demo documents.
 * Keeping the data URL inline avoids fetch/network in the preview iframe.
 */
const PLACEHOLDER_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Empty document — fresh A4 portrait. */
export function emptyDocument(): Document {
    return createDocument();
}

/** Document with two image sections placed on page 1. */
export function documentWithSections(): Document {
    const base = createDocument();
    const sectionA = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    const sectionB = createSection({ x: 220, y: 320, page: 1 }) as ImageSection;
    return {
        ...base,
        sections: [
            { ...sectionA, imageUrl: PLACEHOLDER_PNG, width: 220, height: 160 },
            { ...sectionB, imageUrl: PLACEHOLDER_PNG, width: 180, height: 220 },
        ],
    };
}

/** Document with a single text section on page 1. */
export function documentWithTextSection(text = 'Hello DocMosaic'): Document {
    const base = createDocument();
    const section = createSection({ type: 'text', x: 60, y: 60, page: 1 }) as TextSection;
    return {
        ...base,
        sections: [{ ...section, text, width: 320, height: 80, fontSize: 24 }],
    };
}

/** Document with N pages. Useful for `Editor.PageList` stories. */
export function documentWithPages(count: number): Document {
    const base = createDocument();
    const extra = Math.max(0, count - 1);
    return {
        ...base,
        totalPages: 1 + extra,
        pages: [...base.pages, ...Array.from({ length: extra }, () => createPage())],
    };
}
