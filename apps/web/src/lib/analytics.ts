/**
 * @packageDocumentation
 *
 * Analytics wrapper with an injectable tracker.
 *
 * Editor code (and anything else in this app) calls into `trackEvent.*` and
 * stays decoupled from any concrete analytics provider. The wrapper consults
 * a module-level `currentTracker` function which defaults to a no-op.
 *
 * To wire a real provider (e.g. Vercel Analytics), call `setAnalyticsTracker`
 * once at app boot. See `apps/web/src/app/analytics-bridge.tsx`.
 *
 * Events are only forwarded to the tracker when `process.env.NODE_ENV ===
 * 'production'`. Local dev/staging never produces events.
 */

import { PageOrientation, PageSize } from './types';

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

/**
 * Signature for an analytics tracker function.
 *
 * Receives an event name and an optional payload of primitive properties.
 * Implementations should be side-effect-only (no return value used).
 */
export type AnalyticsTracker = (
    event: string,
    payload?: Record<string, AllowedPropertyValues>,
) => void;

const noop: AnalyticsTracker = () => {};

let currentTracker: AnalyticsTracker = noop;

/**
 * Install the active analytics tracker.
 *
 * Call once at app boot to wire a concrete provider. Passing `noop` (or
 * calling with no argument via a wrapper) effectively disables tracking.
 */
export function setAnalyticsTracker(tracker: AnalyticsTracker): void {
    currentTracker = tracker;
}

const safeTrack = (eventName: string, props?: Record<string, AllowedPropertyValues>) => {
    if (process.env.NODE_ENV === 'production') {
        currentTracker(eventName, props);
    }
};

export const trackEvent = {
    // Editor initialization
    editorInit: () => safeTrack('pdf_editor_init'),

    // Page settings
    pageSize: (size: PageSize) => safeTrack('page_size_change', { size }),
    orientation: (orientation: PageOrientation) => safeTrack('orientation_change', { orientation }),

    // Image sections
    addSection: () => safeTrack('add_image_section'),
    dragSection: () => safeTrack('drag_image_section'),
    resizeSection: () => safeTrack('resize_image_section'),
    duplicateSection: () => safeTrack('duplicate_image_section'),
    removeSection: () => safeTrack('remove_image_section'),

    // Page management
    addPage: () => safeTrack('add_page'),
    reorderPages: () => safeTrack('reorder_pages'),

    // History
    undo: () => safeTrack('undo_action'),
    redo: () => safeTrack('redo_action'),

    // Document actions
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

    // Canvas interactions
    zoom: (level: number) => safeTrack('zoom_change', { level: Math.round(level * 100) }),

    // Document metadata
    rename: (oldName: string, newName: string) =>
        safeTrack('rename_document', {
            from: oldName,
            to: newName,
        }),
};
