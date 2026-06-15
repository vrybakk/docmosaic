/**
 * PDF byte-diff gate.
 *
 * Renders {@link sampleDoc} through {@link generatePDF} and compares the
 * output against a saved fixture (`__fixtures__/sample-doc.pdf.bin`). The
 * first run writes the fixture; every later run asserts bytes equal it.
 *
 * Non-determinism workaround: jsPDF embeds two pieces of metadata that vary
 * per run — `/CreationDate (...)` (depends on system clock + local TZ) and
 * `/ID [ <...> <...> ]` (random). Both are normalized to fixed-length
 * placeholders before saving/comparing so the gate locks in PDF *content*
 * (objects, streams, xref) without chasing wall-clock noise. The replacement
 * strings preserve the original byte length, keeping xref offsets stable.
 *
 * Image-optimization workaround: {@link processImagesForPDF} relies on
 * `HTMLImageElement` + `HTMLCanvasElement`, neither of which work in
 * happy-dom (no canvas backend, no data-URL load events). The test mocks the
 * module to return its input sections unchanged; the rest of `generatePDF`
 * (jsPDF doc construction, page layout, `addImage`) runs for real.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDoc } from './__fixtures__/sample-doc';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '__fixtures__', 'sample-doc.pdf.bin');

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

describe('generatePDF byte-diff gate', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('produces byte-identical PDF for a frozen fixture', async () => {
        const blob = await generatePDF(sampleDoc.sections, {
            pageSize: sampleDoc.pageSize,
            orientation: sampleDoc.orientation,
            pages: sampleDoc.pages,
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
