/**
 * Mock PDF backend used by stories that want to exercise the editor's PDF
 * pipeline without invoking jsPDF inside Storybook's iframe.
 */

import type { EditorPdfBackend } from '@docmosaic/react';

/** Returns a backend that resolves to a tiny placeholder blob immediately. */
export function createMockPdfBackend(): EditorPdfBackend {
    const placeholder = new Blob(['%PDF-1.4 mock\n'], { type: 'application/pdf' });
    return {
        generate: async () => placeholder,
        estimate: () => 1024,
    };
}
