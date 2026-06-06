/**
 * Generates a timestamped filename for document download.
 * Format: `{document name} YYYY-MM-DD HH-mm.pdf`
 */
export function getDownloadFileName(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedName = name.trim() || 'Untitled Document';
    return `${sanitizedName} ${timestamp}.pdf`;
}
