'use client';

import { useEditor } from '../../context/editor';

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Read-only label that shows the estimated output PDF size. Reads
 * `ui.estimatedSize` from the editor context. Renders nothing while the
 * size is unknown (zero).
 */
export function EstimatedSize() {
    const {
        ui: { estimatedSize },
    } = useEditor();
    if (!estimatedSize) return null;
    return (
        <div className="text-sm text-gray-500 hidden sm:block text-nowrap whitespace-nowrap">
            Estimated size: {formatFileSize(estimatedSize)}
        </div>
    );
}
