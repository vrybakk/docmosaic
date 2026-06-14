'use client';

import { cn } from '../../../internal/utils';
import type { ResizeHandle } from './use-section-resize';

interface SectionResizeHandlesProps {
    onResizeStart: (e: React.PointerEvent, handle: ResizeHandle) => void;
}

/** Visual corner square — Figma/Canva style: white fill, primary border. */
const CORNER_VISUAL =
    'h-3 w-3 rounded-[2px] border border-primary bg-background shadow-sm ' +
    'transition-transform duration-150 group-hover:scale-110';

/**
 * Expanded transparent touch zone wrapping the small visual handle. The hit
 * area is ~28px (finger-friendly) while the visible square stays 12px; the
 * negative offset centres the zone on the section corner.
 */
const CORNER_HIT =
    'absolute z-30 flex h-7 w-7 items-center justify-center pointer-events-auto touch-none select-none';

/** Hover-revealed square indicator centered on an edge hit-strip. */
const EDGE_DOT =
    'h-2.5 w-2.5 rounded-[2px] border border-primary bg-background ' +
    'opacity-0 transition-opacity duration-150 group-hover/edge:opacity-100';

const EDGE_HIT =
    'group/edge absolute z-30 flex items-center justify-center pointer-events-auto touch-none select-none';

/** The 8 corner+edge resize handles. Rendered only when selected & not resizing. */
export function SectionResizeHandles({ onResizeStart }: SectionResizeHandlesProps) {
    return (
        <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Corner handles — 28px touch zones, 12px visual square. */}
            <div
                data-resize-handle="true"
                className={cn(CORNER_HIT, '-left-3.5 -top-3.5 cursor-nw-resize')}
                onPointerDown={(e) => onResizeStart(e, 'topLeft')}
                title="Resize"
            >
                <div className={CORNER_VISUAL} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(CORNER_HIT, '-right-3.5 -top-3.5 cursor-ne-resize')}
                onPointerDown={(e) => onResizeStart(e, 'topRight')}
                title="Resize"
            >
                <div className={CORNER_VISUAL} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(CORNER_HIT, '-bottom-3.5 -left-3.5 cursor-sw-resize')}
                onPointerDown={(e) => onResizeStart(e, 'bottomLeft')}
                title="Resize"
            >
                <div className={CORNER_VISUAL} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(CORNER_HIT, '-bottom-3.5 -right-3.5 cursor-se-resize')}
                onPointerDown={(e) => onResizeStart(e, 'bottomRight')}
                title="Resize"
            >
                <div className={CORNER_VISUAL} />
            </div>

            {/* Edge hit-strips — 16px tall/wide touch zones, square shown on hover. */}
            <div
                data-resize-handle="true"
                className={cn(EDGE_HIT, '-top-2 left-4 right-4 h-4 cursor-n-resize')}
                onPointerDown={(e) => onResizeStart(e, 'top')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(EDGE_HIT, '-bottom-2 left-4 right-4 h-4 cursor-s-resize')}
                onPointerDown={(e) => onResizeStart(e, 'bottom')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(EDGE_HIT, '-left-2 top-4 bottom-4 w-4 cursor-w-resize')}
                onPointerDown={(e) => onResizeStart(e, 'left')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className={cn(EDGE_HIT, '-right-2 top-4 bottom-4 w-4 cursor-e-resize')}
                onPointerDown={(e) => onResizeStart(e, 'right')}
            >
                <div className={EDGE_DOT} />
            </div>
        </div>
    );
}
