'use client';

import type { Document } from '@docmosaic/core';
import { useEditor } from '../context/editor';
import { cn } from '../internal/utils';

/**
 * One entry in the template gallery. `document` is the snapshot to load on
 * click; `thumbnail` is any data URL or image src (PNG / SVG / etc.).
 */
export interface TemplateGalleryItem {
    id: string;
    name: string;
    /** Optional thumbnail src. When omitted, the card shows a name-only tile. */
    thumbnail?: string;
    /** Document to load when this template is selected. */
    document: Document;
}

export interface TemplateGalleryProps {
    /** Templates to render — order is preserved. */
    templates: ReadonlyArray<TemplateGalleryItem>;
    /**
     * Fired after the template has been applied via the editor's
     * `UPDATE_DOCUMENT` action. Useful for analytics or closing a dialog.
     */
    onTemplateSelected?: (template: TemplateGalleryItem) => void;
    /** Optional className wrapping the gallery grid. */
    className?: string;
}

/**
 * `Editor.TemplateGallery` — clicking a template dispatches an
 * `UPDATE_DOCUMENT` (via `actions.updateName` + per-field updates wrapped in a
 * single touch) to load the snapshot. We deliberately go through
 * `actions.updateName`-style writes instead of mutating context state
 * directly so undo/redo captures the swap.
 *
 * Pair with {@link exportTemplate} / {@link importTemplate} for the JSON
 * pipeline — the document carried by each gallery item is the same shape
 * those functions produce.
 */
export function TemplateGallery({
    templates,
    onTemplateSelected,
    className,
}: TemplateGalleryProps) {
    const editor = useEditor();

    const handleSelect = (template: TemplateGalleryItem) => {
        // The editor context doesn't expose a public `UPDATE_DOCUMENT` action
        // — we re-create the same effect by updating every top-level field in
        // turn. The reducer touches `updatedAt` on each call so the final
        // snapshot matches the template plus a fresh timestamp.
        //
        // We pipe through the existing action surface so both controlled and
        // uncontrolled roots behave identically and undo/redo (uncontrolled)
        // captures the swap as a single user-visible step.
        const doc = template.document;
        editor.actions.updateName(doc.name);
        editor.actions.updatePageSize(doc.pageSize);
        editor.actions.updateOrientation(doc.orientation);
        // For sections/pages we reach into the lower-level UPDATE_DOCUMENT
        // path. Use the controlled fallback: emit a full document patch via
        // `updateSection` is not viable (it's per-id). Easiest stable hook:
        // call `addPage` / `deletePage` to reconcile counts, then write
        // sections individually. That's lossy and slow — better to expose a
        // first-class `loadDocument` on the action surface, which is the
        // cleanest API and matches what the template story wants.
        editor.actions.loadDocument(doc);
        onTemplateSelected?.(template);
    };

    return (
        <div
            className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3',
                className,
            )}
            data-template-gallery="true"
        >
            {templates.map((template) => (
                <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelect(template)}
                    className={cn(
                        'flex flex-col items-stretch gap-2 p-2 rounded-md text-left',
                        'border border-gray-200 bg-white shadow-sm',
                        'hover:border-editor-accent hover:shadow-md transition',
                    )}
                >
                    <div
                        className={cn(
                            'aspect-[3/4] rounded-sm overflow-hidden bg-gray-50',
                            'flex items-center justify-center',
                        )}
                    >
                        {template.thumbnail ? (
                            <img
                                src={template.thumbnail}
                                alt={`${template.name} preview`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-gray-400 px-2 text-center">
                                {template.name}
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                    </div>
                </button>
            ))}
        </div>
    );
}
