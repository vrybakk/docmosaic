/**
 * Drawing-only PDF byte-diff gate.
 *
 * Mirrors {@link generate.test.ts} but with a fixture that exercises the
 * freehand-stroke render path — multiple strokes per section with distinct
 * colors and weights. Fixture: `__fixtures__/sample-doc-drawing.pdf.bin`.
 * First run writes; every later run asserts bytes match.
 *
 * The `/CreationDate` + `/ID` placeholders from the image gate are reused
 * here so wall-clock noise stays out of the diff.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDrawingDoc } from './__fixtures__/sample-doc-drawing';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '__fixtures__', 'sample-doc-drawing.pdf.bin');

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

describe('generatePDF byte-diff gate (drawing)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('produces byte-identical PDF for a frozen drawing fixture', async () => {
        const blob = await generatePDF(sampleDrawingDoc.sections, {
            pageSize: sampleDrawingDoc.pageSize,
            orientation: sampleDrawingDoc.orientation,
            pages: sampleDrawingDoc.pages,
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
