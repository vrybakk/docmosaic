'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEditorCanvas } from '../../context/editor';
import { Button } from '../../ui/button';

/**
 * Floating zoom controls overlaid on the canvas. Reads zoom state from
 * {@link useEditorCanvas} — must be rendered inside `Editor.Canvas`.
 */
export function CanvasControls() {
    const { zoom, minZoom, maxZoom, zoomIn, zoomOut, reset } = useEditorCanvas();

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 z-10 transition-all duration-200">
            <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                disabled={zoom <= minZoom}
                className="h-8 w-8"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                disabled={zoom === 1}
                className="h-8 w-8"
                title="Reset zoom"
            >
                <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                disabled={zoom >= maxZoom}
                className="h-8 w-8"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
