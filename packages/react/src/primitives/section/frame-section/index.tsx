'use client';

import type { FrameSection as FrameSectionData } from '@docmosaic/core';
import { useCallback, useMemo, useRef } from 'react';
import { useEditor, useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import { useSectionResize } from '../hooks/use-section-resize';
import { SectionFrameToolbar } from './section-frame-toolbar';

/**
 * Container-frame section view. Mirrors the shape/image shell — a selectable,
 * draggable, resizable box — but the content surface is the frame's own
 * background fill + border (matching how {@link generatePDF} draws it). Child
 * sections live flat in `Document.sections` and are rendered by the canvas at
 * their own z-order; this view draws only the frame's box and chrome.
 */
export function FrameSectionView() {
    const editor = useEditorSection();
    const section = editor.section as FrameSectionData;
    const { isSelected, onClick, onUpdate, onDuplicate, onDelete, groupDrag, finalScale, readOnly } =
        editor;
    const { state, actions } = useEditor();
    const frameId = editor.rawSection.id;
    // No image element for a frame; provide a stable empty ref so the resize
    // hook keeps its narrow signature.
    const imageRef = { current: null } as React.RefObject<HTMLImageElement | null>;

    const { isResizing, handleResizeStart } = useSectionResize({ section, onUpdate, imageRef });

    // Frame move = move-with-children: dragging the frame translates the frame
    // plus every section parented to it. Built as a group-drag scoped to the
    // frame (instead of the multi-selection), so a childless frame falls back
    // to the plain single-section path (size 1). When the frame is part of an
    // explicit multi-selection, the selection's group drag wins.
    const sectionsRef = useRef(state.sections);
    sectionsRef.current = state.sections;
    const frameMoveSnapshot = useRef<Map<string, { x: number; y: number }> | null>(null);
    const childCount = state.sections.filter((s) => s.parentFrameId === frameId).length;
    const frameGroupDrag = useMemo(
        () => ({
            size: childCount + 1,
            onStart: () => {
                const snap = new Map<string, { x: number; y: number }>();
                for (const s of sectionsRef.current) {
                    if (s.id === frameId || s.parentFrameId === frameId) {
                        snap.set(s.id, { x: s.x, y: s.y });
                    }
                }
                frameMoveSnapshot.current = snap;
            },
            onMove: (dxPx: number, dyPx: number) => {
                const snap = frameMoveSnapshot.current;
                if (!snap) return;
                const dx = dxPx / finalScale;
                const dy = dyPx / finalScale;
                for (const s of sectionsRef.current) {
                    const start = snap.get(s.id);
                    if (!start) continue;
                    actions.updateSection({
                        ...s,
                        x: Math.round(start.x + dx),
                        y: Math.round(start.y + dy),
                    });
                }
            },
            onEnd: () => {
                frameMoveSnapshot.current = null;
            },
        }),
        [actions, childCount, finalScale, frameId],
    );

    const effectiveGroupDrag = groupDrag.size > 1 ? groupDrag : frameGroupDrag;

    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        isResizing: isResizing || readOnly,
        groupDrag: effectiveGroupDrag,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    const handlePropChange = useCallback(
        (next: Partial<FrameSectionData>) => {
            onUpdate({ ...section, ...next });
        },
        [onUpdate, section],
    );

    // Visual fill / border mirror the PDF draw. `strokeWidth` and `radius` are
    // PDF points, so scale them to display pixels. A transparent fill / border
    // renders nothing — the frame reads as a pure grouping box.
    const fill = section.fill ?? 'transparent';
    const stroke = section.stroke ?? 'transparent';
    const hasFill = fill !== 'transparent';
    const hasStroke = stroke !== 'transparent';
    const radiusPx = (section.radius ?? 0) * finalScale;

    return (
        <div
            {...(readOnly ? {} : bindDrag())}
            data-section="true"
            data-section-id={section.id}
            data-section-type="frame"
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
            {/* Frame fill + border — the part that lands in the PDF. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundColor: hasFill ? fill : undefined,
                    border: hasStroke
                        ? `${(section.strokeWidth ?? 1) * finalScale}px solid ${stroke}`
                        : undefined,
                    borderRadius: radiusPx || undefined,
                }}
            />

            {/* Selection / hover affordance — a thin dashed outline just outside
                the box that turns solid when selected. Never reaches the PDF. */}
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
                <SectionFrameToolbar
                    section={section}
                    isSelected={isSelected}
                    onUpdate={handlePropChange}
                />
            )}

            {/* Hidden shortcuts so duplicate/delete stay reachable through the
                same surface as the other section variants. Hidden in readOnly. */}
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
