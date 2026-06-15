/**
 * Container-frame PDF render tests.
 *
 * Frames are grouping boxes: a frame with no visible fill or border must leave
 * the PDF byte-identical to a document without it (so existing byte-diff
 * fixtures — none of which use frames — stay stable), while a frame with a
 * visible fill must actually draw and change the output.
 *
 * The `/CreationDate` + `/ID` wall-clock placeholders are stripped so the
 * comparison stays deterministic, matching the sibling byte-diff gates.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDocument, createSection } from '../factories';
import type { FrameSection, Section } from '../types';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const CREATION_DATE_RE = /\/CreationDate \(D:[^)]*\)/g;
const ID_RE = /\/ID \[ <[0-9A-Fa-f]+> <[0-9A-Fa-f]+> \]/g;

function normalize(bytes: Uint8Array): string {
    return Buffer.from(bytes)
        .toString('binary')
        .replace(CREATION_DATE_RE, 'CREATION_DATE')
        .replace(ID_RE, 'ID');
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

describe('generatePDF — container frames', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('a transparent frame leaves the PDF byte-identical to no frame', async () => {
        const child = createSection({ type: 'shape', shape: 'rect', x: 20, y: 20, page: 1 });
        const frame = createSection({ type: 'frame', x: 0, y: 0, page: 1 });

        const withFrame = await render([frame, child]);
        const withoutFrame = await render([child]);

        expect(withFrame).toBe(withoutFrame);
    });

    it('a filled frame draws and changes the output', async () => {
        const child = createSection({ type: 'shape', shape: 'rect', x: 20, y: 20, page: 1 });
        const frame = createSection({ type: 'frame', x: 0, y: 0, page: 1 });
        if (frame.type !== 'frame') throw new Error('narrowing');
        const filled: FrameSection = { ...frame, fill: '#ff0000' };

        const transparent = await render([frame, child]);
        const drawn = await render([filled, child]);

        expect(drawn).not.toBe(transparent);
    });

    it('renders a filled frame behind its child regardless of section array order', async () => {
        const child = createSection({ type: 'shape', shape: 'rect', x: 30, y: 30, page: 1 });
        const frame = createSection({ type: 'frame', x: 0, y: 0, page: 1 });
        if (frame.type !== 'frame') throw new Error('narrowing');
        const filled: FrameSection = { ...frame, fill: '#ff0000' };

        // Frame-first and child-first array orders must produce identical bytes:
        // orderSectionsForRender always draws the frame first (behind), so a
        // filled frame can never paint over its contents.
        const frameFirst = await render([filled, child]);
        const childFirst = await render([child, filled]);

        expect(frameFirst).toBe(childFirst);
    });
});
