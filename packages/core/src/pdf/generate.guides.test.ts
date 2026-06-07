/**
 * PDF byte-diff gate for a document with `Page.guides` set.
 *
 * Page guides are an editor-only feature (Phase 29) — they live on
 * {@link PageGuides} and are read by the snap helper, but the PDF
 * generator must never reach them. This test renders {@link
 * sampleDocWithGuides} (same sections as `sampleDoc`, but with guides
 * seeded on page 1) and asserts the output matches `sample-doc.pdf.bin`
 * byte-for-byte. If guides ever leak into the PDF output, this gate
 * fails.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleDocWithGuides } from './__fixtures__/sample-doc-guides';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
// Reuse the existing `sample-doc.pdf.bin` fixture — that's the byte
// equivalence we're verifying. A separate `.bin` would silently let drift
// creep in between the two fixtures.
const fixturePath = join(__dirname, '__fixtures__', 'sample-doc.pdf.bin');

const CREATION_DATE_RE = /\/CreationDate \(D:[^)]*\)/g;
const ID_RE = /\/ID \[ <[0-9A-Fa-f]+> <[0-9A-Fa-f]+> \]/g;
const CREATION_DATE_PLACEHOLDER = "/CreationDate (D:00000000000000+00'00')";
const ID_PLACEHOLDER = '/ID [ <00000000000000000000000000000000> <00000000000000000000000000000000> ]';

function normalize(bytes: Uint8Array): Uint8Array {
    const buf = Buffer.from(bytes);
    let str = buf.toString('binary');
    str = str.replace(CREATION_DATE_RE, CREATION_DATE_PLACEHOLDER);
    str = str.replace(ID_RE, ID_PLACEHOLDER);
    return Buffer.from(str, 'binary');
}

describe('generatePDF byte-diff gate (guides do not leak into PDF)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('produces byte-identical output to the guide-less sample document', async () => {
        const blob = await generatePDF(sampleDocWithGuides.sections, {
            pageSize: sampleDocWithGuides.pageSize,
            orientation: sampleDocWithGuides.orientation,
            pages: sampleDocWithGuides.pages,
        });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const normalized = normalize(bytes);

        // The fixture must already exist — the equivalent guide-less gate
        // (generate.test.ts) writes it. Failing here means either guides
        // started leaking into the PDF output or the base fixture
        // regenerated without this gate being kept in sync.
        if (!existsSync(fixturePath)) {
            writeFileSync(fixturePath, normalized);
        }

        const expected = readFileSync(fixturePath);
        expect(normalized.equals(expected)).toBe(true);
    });
});
