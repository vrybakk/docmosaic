'use client';

import { cn } from '../../../internal/utils';
import type { ResizeHandle } from './use-section-resize';

interface SectionResizeHandlesProps {
    onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
}

/** Small square corner handle — Figma/Canva style: white fill, primary border. */
const CORNER =
    'absolute h-3 w-3 rounded-[2px] border border-primary bg-background shadow-sm ' +
    'pointer-events-auto z-30 transition-transform duration-150 hover:scale-125 select-none';

/** Hover-revealed square indicator centered on an edge hit-strip. */
const EDGE_DOT =
    'absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] ' +
    'border border-primary bg-background opacity-0 transition-opacity duration-150 group-hover/edge:opacity-100';

/** The 8 corner+edge resize handles. Rendered only when selected & not resizing. */
export function SectionResizeHandles({ onResizeStart }: SectionResizeHandlesProps) {
    return (
        <div className="absolute inset-0 z-30 pointer-events-none">
            {/* Corner handles — small squares centered on each corner. */}
            <div
                data-resize-handle="true"
                className={cn(CORNER, '-top-1.5 -left-1.5 cursor-nw-resize')}
                onMouseDown={(e) => onResizeStart(e, 'topLeft')}
                title="Resize"
            />
            <div
                data-resize-handle="true"
                className={cn(CORNER, '-top-1.5 -right-1.5 cursor-ne-resize')}
                onMouseDown={(e) => onResizeStart(e, 'topRight')}
                title="Resize"
            />
            <div
                data-resize-handle="true"
                className={cn(CORNER, '-bottom-1.5 -left-1.5 cursor-sw-resize')}
                onMouseDown={(e) => onResizeStart(e, 'bottomLeft')}
                title="Resize"
            />
            <div
                data-resize-handle="true"
                className={cn(CORNER, '-bottom-1.5 -right-1.5 cursor-se-resize')}
                onMouseDown={(e) => onResizeStart(e, 'bottomRight')}
                title="Resize"
            />

            {/* Edge hit-strips — invisible until hovered, then a small square. */}
            <div
                data-resize-handle="true"
                className="group/edge absolute -top-1 left-3 right-3 h-2 cursor-n-resize select-none pointer-events-auto z-30"
                onMouseDown={(e) => onResizeStart(e, 'top')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className="group/edge absolute -bottom-1 left-3 right-3 h-2 cursor-s-resize select-none pointer-events-auto z-30"
                onMouseDown={(e) => onResizeStart(e, 'bottom')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className="group/edge absolute -left-1 top-3 bottom-3 w-2 cursor-w-resize select-none pointer-events-auto z-30"
                onMouseDown={(e) => onResizeStart(e, 'left')}
            >
                <div className={EDGE_DOT} />
            </div>
            <div
                data-resize-handle="true"
                className="group/edge absolute -right-1 top-3 bottom-3 w-2 cursor-e-resize select-none pointer-events-auto z-30"
                onMouseDown={(e) => onResizeStart(e, 'right')}
            >
                <div className={EDGE_DOT} />
            </div>
        </div>
    );
}
