/**
 * PDF byte-diff gate for the cropped image fixture.
 *
 * Mirrors the harness in `generate.test.ts` (date + ID normalization, mocked
 * image optimizer) but exercises the {@link ImageCrop} render path. The first
 * run writes the fixture; every later run asserts bytes equal it. Lock-step
 * with `generate.test.ts` — when the crop renderer changes intentionally,
 * delete `sample-doc-cropped.pdf.bin` so it gets re-written.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDocCropped } from './__fixtures__/sample-doc-cropped';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '__fixtures__', 'sample-doc-cropped.pdf.bin');

const CREATION_DATE_RE = /\/CreationDate \(D:[^)]*\)/g;
const ID_RE = /\/ID \[ <[0-9A-Fa-f]+> <[0-9A-Fa-f]+> \]/g;
const CREATION_DATE_PLACEHOLDER = "/CreationDate (D:00000000000000+00'00')";
const ID_PLACEHOLDER =
    '/ID [ <00000000000000000000000000000000> <00000000000000000000000000000000> ]';

function normalize(bytes: Uint8Array): Uint8Array {
    const buf = Buffer.from(bytes);
    let str = buf.toString('binary');
    str = str.replace(CREATION_DATE_RE, CREATION_DATE_PLACEHOLDER);
    str = str.replace(ID_RE, ID_PLACEHOLDER);
    return Buffer.from(str, 'binary');
}

describe('generatePDF byte-diff gate (cropped image)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('produces byte-identical PDF for a frozen cropped fixture', async () => {
        const blob = await generatePDF(sampleDocCropped.sections, {
            pageSize: sampleDocCropped.pageSize,
            orientation: sampleDocCropped.orientation,
            pages: sampleDocCropped.pages,
        });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const normalized = normalize(bytes);

        if (!existsSync(fixturePath)) {
            writeFileSync(fixturePath, normalized);
        }

        const expected = readFileSync(fixturePath);
        expect(normalized.equals(expected)).toBe(true);
    });
});
