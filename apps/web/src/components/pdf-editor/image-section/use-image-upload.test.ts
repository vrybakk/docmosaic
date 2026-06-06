import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE, validateImageFile } from './use-image-upload';

// Minimal File stub: we only need `type` and `size`. Real File would also work
// in happy-dom, but constructing one needs Blob shenanigans across runtimes.
function mockFile({ type, size }: { type: string; size: number }): File {
    return { type, size } as File;
}

describe('validateImageFile', () => {
    it('accepts a valid JPEG under the size limit', () => {
        expect(validateImageFile(mockFile({ type: 'image/jpeg', size: 1024 }))).toBeNull();
    });

    it('accepts a valid PNG under the size limit', () => {
        expect(validateImageFile(mockFile({ type: 'image/png', size: 1024 }))).toBeNull();
    });

    it('accepts a valid WebP under the size limit', () => {
        expect(validateImageFile(mockFile({ type: 'image/webp', size: 1024 }))).toBeNull();
    });

    it('rejects a GIF (unsupported MIME)', () => {
        expect(validateImageFile(mockFile({ type: 'image/gif', size: 1024 }))).toBe(
            'invalid-type',
        );
    });

    it('rejects a PDF (wrong MIME)', () => {
        expect(validateImageFile(mockFile({ type: 'application/pdf', size: 1024 }))).toBe(
            'invalid-type',
        );
    });

    it('rejects a JPEG over 10MB', () => {
        expect(
            validateImageFile(mockFile({ type: 'image/jpeg', size: MAX_FILE_SIZE + 1 })),
        ).toBe('too-large');
    });

    it('accepts a JPEG exactly at the size limit', () => {
        expect(
            validateImageFile(mockFile({ type: 'image/jpeg', size: MAX_FILE_SIZE })),
        ).toBeNull();
    });
});
