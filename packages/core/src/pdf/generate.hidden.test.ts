/**
 * Hidden-section omission gate.
 *
 * Renders two fixtures through {@link generatePDF}:
 *
 * 1. {@link sampleHiddenDoc} — 4 visible sections + 1 marked `hidden: true`.
 * 2. {@link sampleHiddenDocControl} — the same document with the hidden
 *    section removed entirely from the array.
 *
 * The two byte streams must match (after the `/CreationDate` + `/ID`
 * normalization that every byte-diff gate uses), confirming that a hidden
 * section contributes nothing to the PDF — not even an empty graphics-state
 * push or a zero-size draw.
 *
 * Saved fixture path: `__fixtures__/sample-doc-hidden.pdf.bin`. First run
 * writes; later runs assert bytes match. Pinning the bytes (in addition to
 * comparing against the control render) guards against an accidental change
 * to the hidden-skipping semantics — e.g. a future refactor that filters
 * elsewhere and leaves a draw stub behind.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sampleHiddenDoc, sampleHiddenDocControl } from './__fixtures__/sample-doc-hidden';
import { generatePDF } from './generate';

vi.mock('./optimize-image', () => ({
    processImagesForPDF: vi.fn(async (sections: unknown[]) => sections),
    optimizeImageForPDF: vi.fn(async (url: string) => url),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(__dirname, '__fixtures__', 'sample-doc-hidden.pdf.bin');

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

describe('generatePDF hidden-section omission gate', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    it('hidden sections produce the same bytes as the control render', async () => {
        const blob = await generatePDF(sampleHiddenDoc.sections, {
            pageSize: sampleHiddenDoc.pageSize,
            orientation: sampleHiddenDoc.orientation,
            pages: sampleHiddenDoc.pages,
        });
        const controlBlob = await generatePDF(sampleHiddenDocControl.sections, {
            pageSize: sampleHiddenDocControl.pageSize,
            orientation: sampleHiddenDocControl.orientation,
            pages: sampleHiddenDocControl.pages,
        });

        const normalized = normalize(new Uint8Array(await blob.arrayBuffer()));
        const controlNormalized = normalize(new Uint8Array(await controlBlob.arrayBuffer()));

        expect(normalized.equals(controlNormalized)).toBe(true);

        if (!existsSync(fixturePath)) {
            writeFileSync(fixturePath, normalized);
        }
        const expected = readFileSync(fixturePath);
        expect(normalized.equals(expected)).toBe(true);
    });
});
