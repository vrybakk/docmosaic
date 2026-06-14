import type { Section } from '@docmosaic/core';
import { useCallback, useRef, useState } from 'react';

/** Minimum section dimension in pixels. */
export const MIN_SECTION_SIZE = 100;

export type ResizeHandle =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';

interface ResizeStart {
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
    aspectRatio?: number;
}

interface UseSectionResizeArgs {
    section: Section;
    onUpdate: (section: Section) => void;
    imageRef: React.RefObject<HTMLImageElement | null>;
}

interface UseSectionResizeResult {
    isResizing: boolean;
    activeHandle: ResizeHandle | null;
    handleResizeStart: (e: React.PointerEvent, handle: ResizeHandle) => void;
    handleResizeToProportion: () => void;
}

/**
 * Computes the next section geometry for a given resize delta.
 * Pure helper exported for unit tests.
 */
export function computeResize(
    start: ResizeStart,
    handle: ResizeHandle,
    dx: number,
    dy: number,
): { x: number; y: number; width: number; height: number } {
    let newWidth = start.width;
    let newHeight = start.height;
    let newX = start.left;
    let newY = start.top;

    const isCorner = handle.length > 5;
    const aspectRatio = isCorner ? start.aspectRatio : undefined;

    switch (handle) {
        case 'right':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width + dx);
            break;
        case 'left':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width - dx);
            newX = start.left + (start.width - newWidth);
            break;
        case 'bottom':
            newHeight = Math.max(MIN_SECTION_SIZE, start.height + dy);
            break;
        case 'top':
            newHeight = Math.max(MIN_SECTION_SIZE, start.height - dy);
            newY = start.top + (start.height - newHeight);
            break;
        case 'bottomRight':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width + dx);
            if (aspectRatio) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = Math.max(MIN_SECTION_SIZE, start.height + dy);
            }
            break;
        case 'bottomLeft':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width - dx);
            newX = start.left + (start.width - newWidth);
            if (aspectRatio) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = Math.max(MIN_SECTION_SIZE, start.height + dy);
            }
            break;
        case 'topRight':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width + dx);
            if (aspectRatio) {
                newHeight = newWidth / aspectRatio;
                newY = start.top + (start.height - newHeight);
            } else {
                newHeight = Math.max(MIN_SECTION_SIZE, start.height - dy);
                newY = start.top + (start.height - newHeight);
            }
            break;
        case 'topLeft':
            newWidth = Math.max(MIN_SECTION_SIZE, start.width - dx);
            newX = start.left + (start.width - newWidth);
            if (aspectRatio) {
                newHeight = newWidth / aspectRatio;
                newY = start.top + (start.height - newHeight);
            } else {
                newHeight = Math.max(MIN_SECTION_SIZE, start.height - dy);
                newY = start.top + (start.height - newHeight);
            }
            break;
    }

    return {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
        height: Math.round(newHeight),
    };
}

/**
 * Owns the 8-handle resize interaction. Attaches window-level mouse listeners
 * during a drag and updates the section via {@link onUpdate}.
 */
export function useSectionResize({
    section,
    onUpdate,
    imageRef,
}: UseSectionResizeArgs): UseSectionResizeResult {
    const [isResizing, setIsResizing] = useState(false);
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const resizeStart = useRef<ResizeStart | null>(null);

    const handleResizeToProportion = useCallback(() => {
        // Only image sections have a natural aspect ratio to snap to.
        if (section.type !== 'image' || !section.imageUrl || !imageRef.current) return;

        const img = imageRef.current;
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        if (img.naturalWidth < MIN_SECTION_SIZE || img.naturalHeight < MIN_SECTION_SIZE) {
            let newWidth = Math.max(MIN_SECTION_SIZE, img.naturalWidth);
            let newHeight = newWidth / aspectRatio;
            if (newHeight < MIN_SECTION_SIZE) {
                newHeight = MIN_SECTION_SIZE;
                newWidth = newHeight * aspectRatio;
            }
            onUpdate({
                ...section,
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            });
        } else if (img.naturalWidth < section.width) {
            onUpdate({
                ...section,
                width: Math.max(MIN_SECTION_SIZE, img.naturalWidth),
                height: Math.max(MIN_SECTION_SIZE, img.naturalHeight),
            });
        } else {
            const newHeight = section.width / aspectRatio;
            onUpdate({
                ...section,
                height: Math.max(MIN_SECTION_SIZE, newHeight),
            });
        }
    }, [section, onUpdate, imageRef]);

    const handleResizeStart = (e: React.PointerEvent, handle: ResizeHandle) => {
        // Only react to the primary pointer (left mouse / first finger); ignore
        // secondary touches so a second finger doesn't restart the resize.
        if (!e.isPrimary) return;
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        setActiveHandle(handle);

        const startData: ResizeStart = {
            x: e.clientX,
            y: e.clientY,
            width: section.width,
            height: section.height,
            left: section.x,
            top: section.y,
            // Lock aspect ratio only for image sections with a loaded image.
            aspectRatio:
                section.type === 'image' && section.imageUrl
                    ? section.width / section.height
                    : undefined,
        };
        resizeStart.current = startData;

        const handlePointerMove = (ev: PointerEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (!resizeStart.current) return;

            const dx = ev.clientX - startData.x;
            const dy = ev.clientY - startData.y;

            const next = computeResize(startData, handle, dx, dy);

            onUpdate({
                ...section,
                ...next,
            });
        };

        const cleanup = () => {
            setIsResizing(false);
            setActiveHandle(null);
            resizeStart.current = null;

            window.removeEventListener('pointermove', handlePointerMove, { capture: true });
            window.removeEventListener('pointerup', handlePointerEnd, { capture: true });
            window.removeEventListener('pointercancel', handlePointerEnd, { capture: true });
        };

        const handlePointerEnd = (ev: PointerEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            cleanup();
        };

        // Pointer events unify mouse, touch, and pen — resize now works by
        // finger. `pointercancel` covers OS gesture interrupts so the drag
        // state never orphans on touch.
        window.addEventListener('pointermove', handlePointerMove, { capture: true });
        window.addEventListener('pointerup', handlePointerEnd, { capture: true });
        window.addEventListener('pointercancel', handlePointerEnd, { capture: true });
    };

    return { isResizing, activeHandle, handleResizeStart, handleResizeToProportion };
}
