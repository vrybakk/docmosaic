/**
 * @packageDocumentation
 *
 * Analytics wrapper with an injectable tracker, mirroring the web app's
 * shape so the moved editor primitives can call `trackEvent.*` without
 * pulling in a framework-specific dependency.
 *
 * Consumers wire a real provider via {@link setReactPackageTracker}. The
 * web app's `analytics-bridge.tsx` installs the Vercel `track` function
 * into both this package's tracker and the app's own tracker on boot.
 *
 * Events are only forwarded when `process.env.NODE_ENV === 'production'`.
 */

import type { PageOrientation, PageSize } from '@docmosaic/core';

interface DocumentStats {
    totalPages: number;
    totalImages: number;
    averageImagesPerPage: number;
    format: PageSize;
    orientation: PageOrientation;
    fileSize: number;
    estimatedSize?: number;
}

type AllowedPropertyValues = string | number | boolean | null;

export type AnalyticsTracker = (
    event: string,
    payload?: Record<string, AllowedPropertyValues>,
) => void;

const noop: AnalyticsTracker = () => {};

let currentTracker: AnalyticsTracker = noop;

/**
 * Install the active analytics tracker for the React package. Called once at
 * app boot from a host-side bridge (e.g. apps/web/src/app/analytics-bridge.tsx).
 */
export function setReactPackageTracker(tracker: AnalyticsTracker): void {
    currentTracker = tracker;
}

const safeTrack = (eventName: string, props?: Record<string, AllowedPropertyValues>) => {
    if (process.env.NODE_ENV === 'production') {
        currentTracker(eventName, props);
    }
};

export const trackEvent = {
    editorInit: () => safeTrack('pdf_editor_init'),
    pageSize: (size: PageSize) => safeTrack('page_size_change', { size }),
    orientation: (orientation: PageOrientation) => safeTrack('orientation_change', { orientation }),
    addSection: () => safeTrack('add_image_section'),
    dragSection: () => safeTrack('drag_image_section'),
    resizeSection: () => safeTrack('resize_image_section'),
    duplicateSection: () => safeTrack('duplicate_image_section'),
    removeSection: () => safeTrack('remove_image_section'),
    addPage: () => safeTrack('add_page'),
    reorderPages: () => safeTrack('reorder_pages'),
    undo: () => safeTrack('undo_action'),
    redo: () => safeTrack('redo_action'),
    preview: () => safeTrack('open_preview'),
    print: (fromPreview: boolean) => safeTrack('print_document', { fromPreview }),
    download: (fromPreview: boolean) => safeTrack('download_pdf', { fromPreview }),
    documentGenerated: (stats: DocumentStats) =>
        safeTrack('document_generated', {
            pages: stats.totalPages,
            images: stats.totalImages,
            imagesPerPage: stats.averageImagesPerPage,
            format: stats.format,
            orientation: stats.orientation,
            sizeKB: stats.fileSize,
            estimatedSizeKB: stats.estimatedSize ?? null,
        }),
    zoom: (level: number) => safeTrack('zoom_change', { level: Math.round(level * 100) }),
    rename: (oldName: string, newName: string) =>
        safeTrack('rename_document', {
            from: oldName,
            to: newName,
        }),
};
