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
    const { isSelected, onClick, onUpdate, onDuplicate, onDelete, groupDrag, onDragEnd, readOnly } =
        editor;
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
        isResizing: isResizing || readOnly,
        groupDrag,
        onDragEnd,
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
            {...(readOnly ? {} : bindDrag())}
            data-section="true"
            data-section-id={section.id}
            data-section-type="shape"
            data-section-shape={section.shape}
            className={cn(
                'absolute overflow-visible group touch-none pointer-events-auto',
                isDragging && 'opacity-50 cursor-grabbing',
                isResizing && 'pointer-events-none',
            )}
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                zIndex: (section.zIndex ?? 0) + (isSelected ? 1000 : 0),
                cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
            }}
            onClick={handleClick}
        >
            {/* Selection / hover affordance — a thin dashed outline that sits
                just outside the box (so it never affects the shape geometry or
                the PDF render) and turns solid when selected. No drop shadow:
                the shape should read as flat vector art, like the text variant. */}
            {!readOnly && (
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute -inset-1 rounded-md border-2 border-dashed border-muted-foreground/40',
                        'opacity-0 transition-opacity group-hover:opacity-100',
                        isSelected && 'border-solid border-primary opacity-100',
                    )}
                />
            )}

            {isSelected && !isResizing && !readOnly && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {!readOnly && (
                <SectionShapeToolbar
                    section={section}
                    isSelected={isSelected}
                    onUpdate={handlePropChange}
                />
            )}

            <div className="relative w-full h-full pointer-events-none">
                <SectionShape section={section} />
            </div>

            {/* Hidden shortcuts so duplicate/delete stay reachable through the
                same surface as image/text variants. Hidden in readOnly. */}
            {!readOnly && (
                <>
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
                </>
            )}
        </div>
    );
}
