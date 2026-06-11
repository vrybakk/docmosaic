'use client';

import { Minus, Plus } from 'lucide-react';
import type { ResizeHandle } from './use-section-resize';

interface SectionResizeHandlesProps {
    onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
}

/** The 8 corner+edge resize handles. Rendered only when selected & not resizing. */
export function SectionResizeHandles({ onResizeStart }: SectionResizeHandlesProps) {
    return (
        <div className="absolute inset-0 transition-opacity duration-200 z-30 pointer-events-none">
            {/* Corner handles */}
            <div
                data-resize-handle="true"
                className="absolute -top-3 -left-3 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-lg cursor-nw-resize hover:scale-110 hover:bg-primary/10 transition-transform duration-150 flex items-center justify-center select-none z-30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'topLeft')}
                title="Resize from top-left"
            >
                <Minus className="w-4 h-4 text-primary" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-lg cursor-ne-resize hover:scale-110 hover:bg-primary/10 transition-transform duration-150 flex items-center justify-center select-none z-30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'topRight')}
                title="Resize from top-right"
            >
                <Plus className="w-4 h-4 text-primary" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute -bottom-3 -left-3 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-lg cursor-sw-resize hover:scale-110 hover:bg-primary/10 transition-transform duration-150 flex items-center justify-center select-none z-30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'bottomLeft')}
                title="Resize from bottom-left"
            >
                <Plus className="w-4 h-4 text-primary" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute -bottom-3 -right-3 w-8 h-8 bg-white border-2 border-primary rounded-full shadow-lg cursor-se-resize hover:scale-110 hover:bg-primary/10 transition-transform duration-150 flex items-center justify-center select-none z-30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'bottomRight')}
                title="Resize from bottom-right"
            >
                <Plus className="w-4 h-4 text-primary" />
            </div>

            {/* Edge handles */}
            <div
                data-resize-handle="true"
                className="absolute top-0 left-4 right-4 h-4 bg-transparent hover:bg-primary/20 cursor-n-resize group/edge select-none z-30 border-t-2 border-transparent hover:border-primary/30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'top')}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute bottom-0 left-4 right-4 h-4 bg-transparent hover:bg-primary/20 cursor-s-resize group/edge select-none z-30 border-b-2 border-transparent hover:border-primary/30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'bottom')}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute left-0 top-4 bottom-4 w-4 bg-transparent hover:bg-primary/20 cursor-w-resize group/edge select-none z-30 border-l-2 border-transparent hover:border-primary/30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'left')}
            >
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>
            <div
                data-resize-handle="true"
                className="absolute right-0 top-4 bottom-4 w-4 bg-transparent hover:bg-primary/20 cursor-e-resize group/edge select-none z-30 border-r-2 border-transparent hover:border-primary/30 pointer-events-auto"
                onMouseDown={(e) => onResizeStart(e, 'right')}
            >
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>
        </div>
    );
}
