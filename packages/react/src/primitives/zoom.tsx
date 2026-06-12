'use client';

import { Maximize2, Minus, Plus } from 'lucide-react';
import { cn } from '../internal/utils';
import { useEditorZoom } from '../hooks/use-editor-zoom';

export interface ZoomProps {
    /** Optional extra className applied to the outer container. */
    className?: string;
}

/**
 * Public zoom widget — five-button strip exposing the {@link useEditorZoom}
 * surface. Drop inside `Editor.Canvas` (or anywhere underneath one) and the
 * primitive picks up scale + actions from context.
 *
 * Layout, left to right:
 *
 * 1. Zoom out (`-`)
 * 2. Percentage label (clickable — clicking it resets to 100%)
 * 3. Zoom in (`+`)
 * 4. Fit-to-screen (re-fits the page to the viewport)
 *
 * Rendered as a subtle rounded-full pill with semantic tokens (`bg-card`,
 * `text-foreground`, `hover:bg-muted`) so it adapts to the active theme
 * without per-theme overrides.
 *
 * @example
 * ```tsx
 * <Editor.Root>
 *   <Editor.Canvas>
 *     <Editor.Section />
 *     <Editor.Zoom />
 *   </Editor.Canvas>
 * </Editor.Root>
 * ```
 */
export function Zoom({ className }: ZoomProps = {}) {
    const { scale, minScale, maxScale, zoomIn, zoomOut, reset, fit } = useEditorZoom();
    const percent = Math.round(scale * 100);

    return (
        <div
            data-zoom-controls="true"
            className={cn(
                'inline-flex items-center gap-0.5 rounded-full border border-border bg-card text-foreground shadow-sm p-1',
                className,
            )}
        >
            <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= minScale}
                aria-label="Zoom out"
                title="Zoom out"
                className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                )}
            >
                <Minus className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={reset}
                aria-label={`Zoom ${percent} percent — click to reset to 100%`}
                title="Reset zoom to 100%"
                className={cn(
                    'inline-flex h-7 min-w-[3rem] items-center justify-center rounded-full px-2 text-sm font-medium tabular-nums transition-colors',
                    'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
            >
                {percent}%
            </button>
            <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= maxScale}
                aria-label="Zoom in"
                title="Zoom in"
                className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                )}
            >
                <Plus className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={fit}
                aria-label="Fit to screen"
                title="Fit to screen"
                className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
            >
                <Maximize2 className="h-4 w-4" />
            </button>
        </div>
    );
}

// Marker recognised by `Editor.Canvas` so it renders the widget once, anchored
// to the canvas viewport, instead of treating it as a per-section template.
(Zoom as unknown as { __editorCanvasOverlay: boolean }).__editorCanvasOverlay = true;
