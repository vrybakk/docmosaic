/**
 * Mock PDF backend used by stories that want to exercise the editor's PDF
 * pipeline without invoking jsPDF inside Storybook's iframe.
 */

import type { EditorPdfBackend } from '@docmosaic/react';

/** Returns a backend that resolves to a tiny placeholder blob immediately. */
export function createMockPdfBackend(): EditorPdfBackend {
    const placeholder = new Blob(['%PDF-1.4 mock\n'], { type: 'application/pdf' });
    const pngPlaceholder = new Blob(
        // PNG signature followed by IEND chunk so the bytes are valid enough
        // for stories to inspect.
        [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        { type: 'image/png' },
    );
    return {
        generate: async () => placeholder,
        estimate: () => 1024,
        generatePNGs: async (_sections, options) => options.pages.map(() => pngPlaceholder),
    };
}
