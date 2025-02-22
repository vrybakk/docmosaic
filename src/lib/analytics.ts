import { track } from '@vercel/analytics';
import { PageOrientation, PageSize } from './types';

export const trackEvent = {
    // Editor initialization
    editorInit: () => track('pdf_editor_init'),

    // Page settings
    pageSize: (size: PageSize) => track('page_size_change', { size }),
    orientation: (orientation: PageOrientation) => track('orientation_change', { orientation }),

    // Image sections
    addSection: () => track('add_image_section'),
    dragSection: () => track('drag_image_section'),
    resizeSection: () => track('resize_image_section'),
    duplicateSection: () => track('duplicate_image_section'),
    removeSection: () => track('remove_image_section'),

    // Page management
    addPage: () => track('add_page'),
    reorderPages: () => track('reorder_pages'),

    // History
    undo: () => track('undo_action'),
    redo: () => track('redo_action'),

    // Document actions
    preview: () => track('open_preview'),
    print: (fromPreview: boolean) => track('print_document', { fromPreview }),
    download: (fromPreview: boolean) => track('download_pdf', { fromPreview }),

    // Canvas interactions
    zoom: (level: number) => track('zoom_change', { level: Math.round(level * 100) }),

    // Document metadata
    rename: (oldName: string, newName: string) =>
        track('rename_document', {
            from: oldName,
            to: newName,
        }),
};
