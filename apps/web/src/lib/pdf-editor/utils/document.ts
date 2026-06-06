/**
 * @deprecated Import factories from `@docmosaic/core` directly. This shim
 * will be removed in Phase 10.
 */
export { createInitialDocument, createNewImageSection, createNewPage } from '@docmosaic/core';

/**
 * Generates a timestamped filename for document download.
 * Format: `{document name} YYYY-MM-DD HH-mm.pdf`
 */
export function getDownloadFileName(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedName = name.trim() || 'Untitled Document';
    return `${sanitizedName} ${timestamp}.pdf`;
}
