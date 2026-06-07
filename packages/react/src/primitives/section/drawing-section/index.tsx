'use client';

import type { DrawingSection as DrawingSectionData } from '@docmosaic/core';
import { useEditor, useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import { useSectionResize } from '../hooks/use-section-resize';
import { DrawingCanvas } from './drawing-canvas';

/**
 * Drawing-variant section view. Mirrors the image/text/shape variant shell —
 * selectable box with drag, resize, and floating actions — but the content
 * surface is a {@link DrawingCanvas} that captures pointer events while the
 * editor is in `drawingMode`.
 *
 * The drag/resize handlers are suppressed while `drawingMode` is active so
 * the drawing surface can own the pointer without fighting react-dnd or the
 * resize hook.
 */
export function DrawingSectionView() {
    const editor = useEditorSection();
    const { ui } = useEditor();
    const section = editor.section as DrawingSectionData;
    const rawSection = editor.rawSection as DrawingSectionData;
    const { isSelected, onClick, onUpdate, onDuplicate, onDelete, finalScale, groupDrag } =
        editor;
    const imageRef = { current: null } as React.RefObject<HTMLImageElement | null>;

    const { isResizing, handleResizeStart } = useSectionResize({
        section,
        onUpdate,
        imageRef,
    });
    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        // While drawing mode is active, drag is suppressed so the canvas
        // pointer handlers see the gesture.
        isResizing: isResizing || ui.drawingMode,
        groupDrag,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // In drawing mode the canvas owns pointer events; surface clicks here
        // shouldn't toggle selection.
        if (ui.drawingMode) return;
        onClick(e);
    };

    return (
        <div
            {...(ui.drawingMode ? {} : bindDrag())}
            data-section="true"
            data-section-type="drawing"
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
                cursor: ui.drawingMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab',
            }}
            onClick={handleClick}
        >
            {isSelected && !isResizing && !ui.drawingMode && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {isSelected && (
                <div className="absolute inset-0 border-2 border-editor-accent border-dashed pointer-events-none z-5" />
            )}

            <div className="relative w-full h-full">
                <DrawingCanvas section={rawSection} finalScale={finalScale} />
            </div>

            {/* Hidden action shortcuts — duplicate/delete remain reachable
                through the keyboard layer like the other variants. */}
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
