'use client';

import { getPageDimensionsWithOrientation } from '@docmosaic/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, useEditorCanvas } from '../context/editor';
import { cn } from '../internal/utils';
import { RULER_THICKNESS } from './ruler';

export interface GuidesProps {
    /** Optional extra className applied to the overlay container. */
    className?: string;
}

interface DragState {
    axis: 'vertical' | 'horizontal';
    /** Live position in PDF points. */
    position: number;
}

/**
 * `Editor.Guides` — interactive guide-line layer. Drag from the top ruler to
 * drop a vertical guide; drag from the left ruler to drop a horizontal one.
 * Click the small × badge to remove a guide. Sections snap to existing
 * guides during multi-select group drag (see {@link computeSnapTargets}).
 *
 * Requires `Editor.Root showRuler` so the source ruler bands exist — when
 * `display.showRuler` is `false`, the primitive renders nothing.
 *
 * Guides are stored on `Page.guides` (PDF points) and persist with the
 * document. They are **never** drawn into the rendered PDF.
 *
 * @example
 * ```tsx
 * <Editor.Root showRuler>
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 * </Editor.Root>
 * ```
 *
 * Editor.Root auto-mounts Editor.Guides alongside Editor.Ruler when
 * `showRuler` is set; mount manually only when you skip the auto-injection
 * (e.g. by hand-rolling a Canvas overlay slot).
 */
export function Guides({ className }: GuidesProps = {}) {
    const { state, actions, display, readOnly } = useEditor();
    const { finalScale } = useEditorCanvas();

    const pageDimensions = useMemo(
        () => getPageDimensionsWithOrientation(state.pageSize, state.orientation),
        [state.pageSize, state.orientation],
    );

    const pageIndex = state.currentPage - 1;
    const page = state.pages[pageIndex];
    const guides = page?.guides ?? { vertical: [], horizontal: [] };

    const containerRef = useRef<HTMLDivElement>(null);
    const [drag, setDrag] = useState<DragState | null>(null);
    const dragRef = useRef<DragState | null>(null);
    dragRef.current = drag;

    // Convert a viewport-relative pointer position to PDF points relative to
    // the page top-left. The page is offset by RULER_THICKNESS when rulers
    // are visible, so subtract that gutter before dividing by finalScale.
    const pointerToPagePoint = useCallback(
        (clientX: number, clientY: number) => {
            const node = containerRef.current;
            if (!node) return null;
            const rect = node.getBoundingClientRect();
            const x = (clientX - rect.left - RULER_THICKNESS) / finalScale;
            const y = (clientY - rect.top - RULER_THICKNESS) / finalScale;
            return { x, y };
        },
        [finalScale],
    );

    const handleRulerPointerDown = useCallback(
        (axis: 'vertical' | 'horizontal') => (e: React.PointerEvent) => {
            if (readOnly) return;
            const point = pointerToPagePoint(e.clientX, e.clientY);
            if (!point) return;
            e.preventDefault();
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDrag({
                axis,
                position: axis === 'vertical' ? point.x : point.y,
            });
        },
        [pointerToPagePoint, readOnly],
    );

    // Track the drag while the pointer moves anywhere — the pointer capture
    // keeps `pointermove` firing on the ruler band even when the cursor
    // leaves it. The dragRef short-circuits the listener when no drag is
    // active so the global `pointermove` cost is one ref read.
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            const current = dragRef.current;
            if (!current) return;
            const point = pointerToPagePoint(e.clientX, e.clientY);
            if (!point) return;
            setDrag({
                axis: current.axis,
                position: current.axis === 'vertical' ? point.x : point.y,
            });
        };
        const onUp = (e: PointerEvent) => {
            const current = dragRef.current;
            if (!current) {
                setDrag(null);
                return;
            }
            const point = pointerToPagePoint(e.clientX, e.clientY);
            if (point && pageDimensions) {
                const inPage =
                    point.x >= 0 &&
                    point.x <= pageDimensions.width &&
                    point.y >= 0 &&
                    point.y <= pageDimensions.height;
                // Drop only when the pointer ended inside the page area —
                // releasing back over the ruler cancels the drag, matching
                // most graphics-tools convention for "throw away guide".
                if (inPage) {
                    const pos =
                        current.axis === 'vertical' ? point.x : point.y;
                    actions.addGuide(pageIndex, current.axis, Math.round(pos));
                }
            }
            setDrag(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [actions, pageIndex, pageDimensions, pointerToPagePoint]);

    if (!display.showRuler) return null;
    if (!pageDimensions) return null;

    const widthPx = pageDimensions.width * finalScale;
    const heightPx = pageDimensions.height * finalScale;

    const onDelete = (axis: 'vertical' | 'horizontal', position: number) => {
        if (readOnly) return;
        actions.removeGuide(pageIndex, axis, position);
    };

    return (
        <div
            ref={containerRef}
            data-editor-guides="true"
            className={cn('absolute inset-0 z-20 pointer-events-none', className)}
        >
            {/* Ruler hit zones — narrow strips matching the ruler bands. They
                pick up the pointer-down that starts a drag, then global
                listeners (above) finish the gesture. */}
            <div
                data-editor-guides-source="horizontal"
                className="absolute top-0 left-0 right-0 cursor-ew-resize pointer-events-auto"
                style={{
                    height: RULER_THICKNESS,
                    left: RULER_THICKNESS,
                    width: widthPx,
                }}
                onPointerDown={handleRulerPointerDown('vertical')}
            />
            <div
                data-editor-guides-source="vertical"
                className="absolute top-0 left-0 bottom-0 cursor-ns-resize pointer-events-auto"
                style={{
                    width: RULER_THICKNESS,
                    top: RULER_THICKNESS,
                    height: heightPx,
                }}
                onPointerDown={handleRulerPointerDown('horizontal')}
            />

            {/* Persisted guides + the live drag preview. Live previews share
                the same visual style so the user sees exactly where the
                guide will land. */}
            <div
                className="absolute"
                style={{
                    left: RULER_THICKNESS,
                    top: RULER_THICKNESS,
                    width: widthPx,
                    height: heightPx,
                }}
            >
                {guides.vertical.map((pos) => (
                    <GuideLine
                        key={`v-${pos}`}
                        axis="vertical"
                        position={pos}
                        scale={finalScale}
                        widthPx={widthPx}
                        heightPx={heightPx}
                        onDelete={() => onDelete('vertical', pos)}
                        deletable={!readOnly}
                    />
                ))}
                {guides.horizontal.map((pos) => (
                    <GuideLine
                        key={`h-${pos}`}
                        axis="horizontal"
                        position={pos}
                        scale={finalScale}
                        widthPx={widthPx}
                        heightPx={heightPx}
                        onDelete={() => onDelete('horizontal', pos)}
                        deletable={!readOnly}
                    />
                ))}
                {drag && (
                    <GuideLine
                        axis={drag.axis}
                        position={drag.position}
                        scale={finalScale}
                        widthPx={widthPx}
                        heightPx={heightPx}
                        preview
                    />
                )}
            </div>
        </div>
    );
}

interface GuideLineProps {
    axis: 'vertical' | 'horizontal';
    position: number;
    scale: number;
    widthPx: number;
    heightPx: number;
    onDelete?: () => void;
    deletable?: boolean;
    /**
     * When `true`, the guide is rendered as a transient drag preview and
     * omits its delete affordance.
     */
    preview?: boolean;
}

function GuideLine({
    axis,
    position,
    scale,
    widthPx,
    heightPx,
    onDelete,
    deletable = false,
    preview = false,
}: GuideLineProps) {
    const positionPx = position * scale;
    if (axis === 'vertical') {
        return (
            <>
                <div
                    data-editor-guide={preview ? 'preview' : 'vertical'}
                    className="absolute pointer-events-none border-l border-dashed border-muted-foreground"
                    style={{
                        left: positionPx,
                        top: 0,
                        height: heightPx,
                        width: 0,
                    }}
                />
                {deletable && onDelete && (
                    <button
                        type="button"
                        aria-label={`Remove vertical guide at ${Math.round(position)}pt`}
                        onClick={onDelete}
                        className="absolute pointer-events-auto rounded-full bg-muted text-muted-foreground hover:bg-muted/80 leading-none text-[10px] w-3 h-3 flex items-center justify-center"
                        style={{
                            left: positionPx - 6,
                            top: -10,
                        }}
                    >
                        ×
                    </button>
                )}
            </>
        );
    }
    return (
        <>
            <div
                data-editor-guide={preview ? 'preview' : 'horizontal'}
                className="absolute pointer-events-none border-t border-dashed border-muted-foreground"
                style={{
                    top: positionPx,
                    left: 0,
                    width: widthPx,
                    height: 0,
                }}
            />
            {deletable && onDelete && (
                <button
                    type="button"
                    aria-label={`Remove horizontal guide at ${Math.round(position)}pt`}
                    onClick={onDelete}
                    className="absolute pointer-events-auto rounded-full bg-muted text-muted-foreground hover:bg-muted/80 leading-none text-[10px] w-3 h-3 flex items-center justify-center"
                    style={{
                        top: positionPx - 6,
                        left: -10,
                    }}
                >
                    ×
                </button>
            )}
        </>
    );
}

(Guides as unknown as { __editorCanvasOverlayFull: boolean }).__editorCanvasOverlayFull = true;
