'use client';

import type { Section } from '@docmosaic/core';
import { useCallback, useMemo, useRef } from 'react';
import { useEditor } from '../../context/editor';
import { computeGroupBBox, type SnapBBox } from './snap';

interface SelectionBoundsProps {
    sections: ReadonlyArray<Section>;
    selectedIds: ReadonlySet<string>;
    finalScale: number;
    pageDimensions: { width: number; height: number };
}

type GroupHandle =
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom';

/**
 * Compute the next group-resize bbox for a given handle drag (display
 * pixels). Returns the new bbox. Each selected section is then mapped from
 * the start bbox onto the new bbox proportionally — same ratios in both axes.
 *
 * Exported for unit tests.
 */
export function computeGroupResize(
    start: SnapBBox,
    handle: GroupHandle,
    dx: number,
    dy: number,
    minSize = 20,
): SnapBBox {
    let x = start.x;
    let y = start.y;
    let width = start.width;
    let height = start.height;

    switch (handle) {
        case 'right':
            width = Math.max(minSize, start.width + dx);
            break;
        case 'left':
            width = Math.max(minSize, start.width - dx);
            x = start.x + (start.width - width);
            break;
        case 'bottom':
            height = Math.max(minSize, start.height + dy);
            break;
        case 'top':
            height = Math.max(minSize, start.height - dy);
            y = start.y + (start.height - height);
            break;
        case 'bottomRight':
            width = Math.max(minSize, start.width + dx);
            height = Math.max(minSize, start.height + dy);
            break;
        case 'bottomLeft':
            width = Math.max(minSize, start.width - dx);
            x = start.x + (start.width - width);
            height = Math.max(minSize, start.height + dy);
            break;
        case 'topRight':
            width = Math.max(minSize, start.width + dx);
            height = Math.max(minSize, start.height - dy);
            y = start.y + (start.height - height);
            break;
        case 'topLeft':
            width = Math.max(minSize, start.width - dx);
            x = start.x + (start.width - width);
            height = Math.max(minSize, start.height - dy);
            y = start.y + (start.height - height);
            break;
    }

    return { x, y, width, height };
}

/**
 * Map a single section from the start group bbox onto the new bbox — the
 * relative position and size are preserved proportionally.
 */
export function mapSectionToBBox(
    section: { x: number; y: number; width: number; height: number },
    startBBox: SnapBBox,
    nextBBox: SnapBBox,
): { x: number; y: number; width: number; height: number } {
    const sx = startBBox.width === 0 ? 1 : nextBBox.width / startBBox.width;
    const sy = startBBox.height === 0 ? 1 : nextBBox.height / startBBox.height;
    return {
        x: Math.round(nextBBox.x + (section.x - startBBox.x) * sx),
        y: Math.round(nextBBox.y + (section.y - startBBox.y) * sy),
        width: Math.max(1, Math.round(section.width * sx)),
        height: Math.max(1, Math.round(section.height * sy)),
    };
}

/**
 * Render the dashed bounding rectangle around the multi-selection plus 8
 * group resize handles. Drag a handle to scale all selected sections
 * proportionally about the group bbox.
 *
 * Reads selection from {@link useEditor}; mounted by {@link Canvas} when the
 * selection size is greater than one. Coordinates are display pixels — the
 * caller passes `finalScale` so the bbox aligns with the section rectangles.
 *
 * Phase 16.
 */
export function SelectionBounds({
    sections,
    selectedIds,
    finalScale,
    pageDimensions,
}: SelectionBoundsProps) {
    const { actions } = useEditor();

    const selectedSections = useMemo(
        () => sections.filter((s) => selectedIds.has(s.id)),
        [sections, selectedIds],
    );

    const rawBBox = useMemo(() => computeGroupBBox(selectedSections), [selectedSections]);

    // Resize snapshot so successive mousemove events keep their reference frame.
    const resizeRef = useRef<{
        handle: GroupHandle;
        startClientX: number;
        startClientY: number;
        startBBox: SnapBBox;
        positions: Map<string, { x: number; y: number; width: number; height: number }>;
    } | null>(null);

    const onResizeStart = useCallback(
        (e: React.MouseEvent, handle: GroupHandle) => {
            e.preventDefault();
            e.stopPropagation();
            if (!rawBBox) return;
            const positions = new Map(
                selectedSections.map((s) => [
                    s.id,
                    { x: s.x, y: s.y, width: s.width, height: s.height },
                ]),
            );
            resizeRef.current = {
                handle,
                startClientX: e.clientX,
                startClientY: e.clientY,
                startBBox: rawBBox,
                positions,
            };

            const onMove = (ev: MouseEvent) => {
                const snap = resizeRef.current;
                if (!snap) return;
                const dx = (ev.clientX - snap.startClientX) / finalScale;
                const dy = (ev.clientY - snap.startClientY) / finalScale;
                const next = computeGroupResize(snap.startBBox, snap.handle, dx, dy);
                // Clamp to page so the group can't be dragged off-canvas during
                // resize — keeps the math reversible and behavior predictable.
                const clamped: SnapBBox = {
                    x: Math.max(0, Math.min(pageDimensions.width - next.width, next.x)),
                    y: Math.max(0, Math.min(pageDimensions.height - next.height, next.y)),
                    width: next.width,
                    height: next.height,
                };
                for (const s of selectedSections) {
                    const start = snap.positions.get(s.id);
                    if (!start) continue;
                    const mapped = mapSectionToBBox(start, snap.startBBox, clamped);
                    actions.updateSection({ ...s, ...mapped });
                }
            };

            const onUp = () => {
                resizeRef.current = null;
                window.removeEventListener('mousemove', onMove, { capture: true });
                window.removeEventListener('mouseup', onUp, { capture: true });
            };

            window.addEventListener('mousemove', onMove, { capture: true });
            window.addEventListener('mouseup', onUp, { capture: true });
        },
        [actions, finalScale, pageDimensions.height, pageDimensions.width, rawBBox, selectedSections],
    );

    if (!rawBBox) return null;
    const scaled = {
        left: rawBBox.x * finalScale,
        top: rawBBox.y * finalScale,
        width: rawBBox.width * finalScale,
        height: rawBBox.height * finalScale,
    };

    const handleBase =
        'absolute w-3 h-3 bg-white border-2 border-editor-accent rounded-full shadow pointer-events-auto';

    return (
        <div
            data-selection-bounds="true"
            className="absolute pointer-events-none border-2 border-dashed border-editor-accent"
            style={scaled}
        >
            <div
                data-selection-handle="true"
                className={`${handleBase} -top-1.5 -left-1.5 cursor-nw-resize`}
                onMouseDown={(e) => onResizeStart(e, 'topLeft')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} -top-1.5 -right-1.5 cursor-ne-resize`}
                onMouseDown={(e) => onResizeStart(e, 'topRight')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} -bottom-1.5 -left-1.5 cursor-sw-resize`}
                onMouseDown={(e) => onResizeStart(e, 'bottomLeft')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} -bottom-1.5 -right-1.5 cursor-se-resize`}
                onMouseDown={(e) => onResizeStart(e, 'bottomRight')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize`}
                onMouseDown={(e) => onResizeStart(e, 'top')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize`}
                onMouseDown={(e) => onResizeStart(e, 'bottom')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize`}
                onMouseDown={(e) => onResizeStart(e, 'left')}
            />
            <div
                data-selection-handle="true"
                className={`${handleBase} top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize`}
                onMouseDown={(e) => onResizeStart(e, 'right')}
            />
        </div>
    );
}
