/**
 * Placeholder-frame (image mask) PDF render tests.
 *
 * A `maskShape: 'circle'` clips the image to the inscribed ellipse, so it must
 * change the output. `'rect'` (and absent) is the full rectangle — it must
 * render byte-identically to a plain unmasked image, proving the byte-stable
 * legacy `addImage` path is preserved.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDocument } from '../factories';
import type { ImageSection, Section } from '../types';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const TINY_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

const CREATION_DATE_RE = /\/CreationDate \(D:[^)]*\)/g;
const ID_RE = /\/ID \[ <[0-9A-Fa-f]+> <[0-9A-Fa-f]+> \]/g;

function normalize(bytes: Uint8Array): string {
    return Buffer.from(bytes)
        .toString('binary')
        .replace(CREATION_DATE_RE, 'CREATION_DATE')
        .replace(ID_RE, 'ID');
}

function imageSection(maskShape?: 'rect' | 'circle'): ImageSection {
    return {
        id: 'img-1',
        type: 'image',
        imageUrl: TINY_PNG,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        page: 1,
        zIndex: 0,
        ...(maskShape ? { maskShape } : {}),
    };
}

async function render(sections: Section[]): Promise<string> {
    const doc = createDocument();
    const blob = await generatePDF(sections, {
        pageSize: doc.pageSize,
        orientation: doc.orientation,
        pages: doc.pages,
    });
    return normalize(new Uint8Array(await blob.arrayBuffer()));
}

describe('generatePDF — placeholder (image) frames', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('a circle-masked image renders differently from an unmasked image', async () => {
        const plain = await render([imageSection()]);
        const circle = await render([imageSection('circle')]);
        expect(circle).not.toBe(plain);
    });

    it('a rect mask renders byte-identically to no mask (preserves the legacy path)', async () => {
        const plain = await render([imageSection()]);
        const rect = await render([imageSection('rect')]);
        expect(rect).toBe(plain);
    });

    it('a circle mask composes with a crop — distinct from mask-only and crop-only', async () => {
        const crop = { x: 20, y: 20, width: 100, height: 100 };
        const cropOnly = await render([{ ...imageSection(), crop }]);
        const maskOnly = await render([imageSection('circle')]);
        const both = await render([{ ...imageSection('circle'), crop }]);
        // The combined branch (clip to ellipse, then draw the cropped/zoomed
        // image) must differ from each effect alone, locking in that both the
        // clip and the crop scale/offset are applied.
        expect(both).not.toBe(cropOnly);
        expect(both).not.toBe(maskOnly);
    });
});
