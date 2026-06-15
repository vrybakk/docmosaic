/**
 * Generates a timestamped filename for document download.
 * Format: `{document name} YYYY-MM-DD HH-mm.{ext}` — extension defaults to
 * `pdf`. Pass `'png'` to mint the per-page PNG dump names.
 */
export function getDownloadFileName(name: string, ext: string = 'pdf'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedName = name.trim() || 'Untitled Document';
    return `${sanitizedName} ${timestamp}.${ext}`;
}
