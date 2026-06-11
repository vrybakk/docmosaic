'use client';

import { getPageDimensionsWithOrientation, type Section } from '@docmosaic/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, useEditorCanvas } from '../context/editor';
import { cn } from '../internal/utils';

export interface MinimapProps {
    /** Optional extra className applied to the outer container. */
    className?: string;
    /**
     * Maximum size for the minimap thumbnail (CSS pixels). The thumbnail
     * preserves the page aspect ratio so the actual dimensions are at most
     * `maxSize` on the longer axis. Defaults to `200`.
     */
    maxSize?: number;
}

/**
 * Map a section type to a fill color drawn into the minimap thumbnail.
 *
 * @remarks
 * Uses theme tokens so the colors stay legible in both light and dark
 * variants. The palette is intentionally muted — the minimap is a
 * peripheral surface, not the primary preview.
 */
function sectionFill(type: Section['type']): string {
    switch (type) {
        case 'text':
            return 'rgb(var(--accent) / 0.6)';
        case 'shape':
            return 'rgb(var(--success, 34 197 94) / 0.6)';
        case 'drawing':
            return 'rgb(var(--ring) / 0.5)';
        case 'image':
        default:
            return 'rgb(var(--muted-foreground) / 0.4)';
    }
}

/**
 * `Editor.Minimap` — small thumbnail of the current page anchored to the
 * canvas viewport's bottom-right corner. Renders each section as a colored
 * rectangle by type and a red viewport rectangle showing the currently
 * visible region. Dragging the viewport rect pans the main canvas via the
 * canvas scroll position.
 *
 * Opt in via `<Editor.Root showMinimap>` (auto-mounts this primitive) or
 * render manually inside `Editor.Canvas` for custom placement.
 *
 * @example
 * ```tsx
 * <Editor.Root showMinimap>
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 * </Editor.Root>
 * ```
 */
export function Minimap({ className, maxSize = 200 }: MinimapProps = {}) {
    const { state } = useEditor();
    const { finalScale } = useEditorCanvas();

    const pageDimensions = useMemo(
        () => getPageDimensionsWithOrientation(state.pageSize, state.orientation),
        [state.pageSize, state.orientation],
    );

    // Mirror the canvas viewport so the red rect tracks live scrolling.
    // We attach to the closest scrollable ancestor that owns the canvas pane
    // — `Editor.Canvas` runs `overflow-auto` on that node.
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState({
        scrollLeft: 0,
        scrollTop: 0,
        clientWidth: 0,
        clientHeight: 0,
    });
    const scrollNodeRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        // Walk up from the minimap container to find the first scrollable
        // ancestor — that's the Canvas viewport.
        let node: HTMLElement | null = containerRef.current.parentElement;
        while (node && node !== document.body) {
            const style = getComputedStyle(node);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                scrollNodeRef.current = node;
                break;
            }
            node = node.parentElement;
        }
        const scroll = scrollNodeRef.current;
        if (!scroll) return;
        const update = () => {
            setViewport({
                scrollLeft: scroll.scrollLeft,
                scrollTop: scroll.scrollTop,
                clientWidth: scroll.clientWidth,
                clientHeight: scroll.clientHeight,
            });
        };
        update();
        scroll.addEventListener('scroll', update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(scroll);
        return () => {
            scroll.removeEventListener('scroll', update);
            observer.disconnect();
        };
    }, []);

    // Drag the viewport rectangle to pan the canvas. Delta is converted from
    // minimap pixels to canvas pixels via the inverse of the minimap scale.
    const dragRef = useRef<{
        startX: number;
        startY: number;
        scrollLeft: number;
        scrollTop: number;
    } | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const scroll = scrollNodeRef.current;
        if (!scroll) return;
        e.preventDefault();
        (e.target as Element).setPointerCapture?.(e.pointerId);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            scrollLeft: scroll.scrollLeft,
            scrollTop: scroll.scrollTop,
        };
    }, []);

    if (!pageDimensions) return null;

    const pageWidthPt = pageDimensions.width;
    const pageHeightPt = pageDimensions.height;
    const minimapScale =
        Math.min(maxSize / pageWidthPt, maxSize / pageHeightPt) || maxSize / pageWidthPt;
    const minimapWidth = pageWidthPt * minimapScale;
    const minimapHeight = pageHeightPt * minimapScale;

    const currentPageSections = state.sections.filter(
        (s) => s.page === state.currentPage && !s.hidden,
    );

    // Viewport rectangle: the canvas displays the page at `finalScale` and
    // the user scrolls within that. Convert scroll position + viewport size
    // from canvas pixels back to page points, then scale to minimap pixels.
    const canvasPageOriginX = 0;
    const canvasPageOriginY = 0;
    const visibleLeftPt = (viewport.scrollLeft - canvasPageOriginX) / finalScale;
    const visibleTopPt = (viewport.scrollTop - canvasPageOriginY) / finalScale;
    const visibleWidthPt = viewport.clientWidth / finalScale;
    const visibleHeightPt = viewport.clientHeight / finalScale;

    const viewportRect = {
        left: Math.max(0, visibleLeftPt * minimapScale),
        top: Math.max(0, visibleTopPt * minimapScale),
        width: Math.min(minimapWidth, visibleWidthPt * minimapScale),
        height: Math.min(minimapHeight, visibleHeightPt * minimapScale),
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const drag = dragRef.current;
        const scroll = scrollNodeRef.current;
        if (!drag || !scroll) return;
        const dx = (e.clientX - drag.startX) / minimapScale;
        const dy = (e.clientY - drag.startY) / minimapScale;
        scroll.scrollLeft = drag.scrollLeft + dx * finalScale;
        scroll.scrollTop = drag.scrollTop + dy * finalScale;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        dragRef.current = null;
        try {
            (e.target as Element).releasePointerCapture?.(e.pointerId);
        } catch {
            // capture may not have been set on this element
        }
    };

    return (
        <div
            ref={containerRef}
            data-editor-minimap="true"
            className={cn(
                'absolute bottom-4 right-4 z-10 rounded-md border border-border bg-card shadow-sm p-1',
                className,
            )}
            style={{ width: minimapWidth + 8, height: minimapHeight + 8 }}
        >
            <div
                className="relative bg-background border border-border overflow-hidden"
                style={{ width: minimapWidth, height: minimapHeight }}
            >
                {currentPageSections.map((s) => (
                    <div
                        key={s.id}
                        data-minimap-section={s.type}
                        className="absolute"
                        style={{
                            left: s.x * minimapScale,
                            top: s.y * minimapScale,
                            width: s.width * minimapScale,
                            height: s.height * minimapScale,
                            background: sectionFill(s.type),
                        }}
                    />
                ))}
                {/* Viewport rectangle — red border + grab cursor so it's
                    obvious what the rectangle controls. */}
                <div
                    data-minimap-viewport="true"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="absolute cursor-grab active:cursor-grabbing border border-destructive"
                    style={{
                        left: viewportRect.left,
                        top: viewportRect.top,
                        width: viewportRect.width,
                        height: viewportRect.height,
                    }}
                />
            </div>
        </div>
    );
}

(Minimap as unknown as { __editorCanvasOverlayFull: boolean }).__editorCanvasOverlayFull = true;
