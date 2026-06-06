'use client';

interface EstimatedSizeProps {
    /** Estimated file size in bytes. */
    bytes: number;
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Read-only label that shows the estimated output PDF size. Renders nothing
 * when `bytes` is falsy.
 */
export function EstimatedSize({ bytes }: EstimatedSizeProps) {
    if (!bytes) return null;
    return (
        <div className="text-sm text-gray-500 hidden sm:block text-nowrap whitespace-nowrap">
            Estimated size: {formatFileSize(bytes)}
        </div>
    );
}
