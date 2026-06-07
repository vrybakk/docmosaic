'use client';

import type { ShapeSection as ShapeSectionData } from '@docmosaic/core';
import { useCallback } from 'react';
import { useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import { useSectionResize } from '../hooks/use-section-resize';
import { SectionShape } from './section-shape';
import { SectionShapeToolbar } from './section-shape-toolbar';

/**
 * Shape-variant section view. Mirrors the image/text variant shell —
 * selectable box with drag, resize, and a top-right floating toolbar — but
 * the content surface is an inline SVG primitive ({@link SectionShape}) that
 * mirrors how the PDF generator draws the shape.
 */
export function ShapeSectionView() {
    const editor = useEditorSection();
    const section = editor.section as ShapeSectionData;
    const { isSelected, onClick, onUpdate, onDuplicate, onDelete, groupDrag } = editor;
    // No image element for shape; provide a stable empty ref so the resize
    // hook can keep its narrow signature.
    const imageRef = { current: null } as React.RefObject<HTMLImageElement | null>;

    const { isResizing, handleResizeStart } = useSectionResize({
        section,
        onUpdate,
        imageRef,
    });
    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        isResizing,
        groupDrag,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    const handlePropChange = useCallback(
        (next: Partial<ShapeSectionData>) => {
            onUpdate({ ...section, ...next });
        },
        [onUpdate, section],
    );

    return (
        <div
            {...bindDrag()}
            data-section="true"
            data-section-type="shape"
            data-section-shape={section.shape}
            className={cn(
                'absolute p-1',
                'border-2 border-dashed border-gray-300 hover:border-editor-accent/50',
                'rounded-lg overflow-visible group touch-none pointer-events-auto',
                isSelected && 'border-solid border-editor-accent shadow-lg',
                isDragging && 'opacity-50 cursor-grabbing',
                isResizing && 'pointer-events-none',
            )}
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                zIndex: (section.zIndex ?? 0) + (isSelected ? 1000 : 0),
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onClick={handleClick}
        >
            {isSelected && !isResizing && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {isSelected && (
                <div className="absolute inset-0 border-2 border-editor-accent border-dashed pointer-events-none z-5" />
            )}

            <SectionShapeToolbar
                section={section}
                isSelected={isSelected}
                onUpdate={handlePropChange}
            />

            <div className="relative w-full h-full pointer-events-none">
                <SectionShape section={section} />
            </div>

            {/* Hidden shortcuts so duplicate/delete stay reachable through the
                same surface as image/text variants. */}
            <button
                type="button"
                aria-label="duplicate"
                tabIndex={-1}
                className="sr-only"
                onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(section);
                }}
            />
            <button
                type="button"
                aria-label="delete"
                tabIndex={-1}
                className="sr-only"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(section.id);
                }}
            />
        </div>
    );
}
