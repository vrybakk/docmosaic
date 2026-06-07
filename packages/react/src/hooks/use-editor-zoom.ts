'use client';

/**
 * @packageDocumentation
 *
 * Public zoom API for the editor. Thin focused wrapper around the per-canvas
 * viewport context exposed by {@link useEditorCanvas}, so consumers can build
 * their own zoom widgets without poking the rest of the canvas state surface.
 */

import { useEditorCanvas } from '../context/editor';

/**
 * Action surface returned by {@link useEditorZoom}.
 *
 * `scale` is the manual zoom multiplier (1 = 100%). It is **not** the combined
 * display scale — the canvas multiplies it by an auto-fit `pageScale` to fill
 * the available space. Read {@link useEditorCanvas} directly if you need
 * `finalScale` or `pageScale`.
 */
export interface UseEditorZoomResult {
    /** Current manual zoom multiplier (1 = 100%). */
    scale: number;
    /** Lower bound enforced by the canvas (defaults to 0.5). */
    minScale: number;
    /** Upper bound enforced by the canvas (defaults to 2). */
    maxScale: number;
    /** Step up by the canvas's zoom increment (default 0.1), clamped. */
    zoomIn: () => void;
    /** Step down by the canvas's zoom increment (default 0.1), clamped. */
    zoomOut: () => void;
    /** Snap back to 100% (also resets any pan). */
    reset: () => void;
    /**
     * Fit-to-screen — semantically distinct from `reset` but currently
     * delegates to it: the canvas already auto-fits the page at `scale === 1`
     * via its own `pageScale` measurement, so setting the manual zoom back to 1
     * is exactly the fit-to-screen action.
     */
    fit: () => void;
}

/**
 * Public zoom hook. Use this when building a custom zoom widget — the bundled
 * {@link Editor.Zoom} primitive is a ready-made consumer.
 *
 * Throws when called outside an `Editor.Canvas` (the per-canvas viewport
 * context isn't mounted anywhere else).
 *
 * @example
 * ```tsx
 * function MiniZoom() {
 *   const { scale, zoomIn, zoomOut, reset } = useEditorZoom();
 *   return (
 *     <div>
 *       <button onClick={zoomOut}>-</button>
 *       <span>{Math.round(scale * 100)}%</span>
 *       <button onClick={zoomIn}>+</button>
 *       <button onClick={reset}>100%</button>
 *     </div>
 *   );
 * }
 *
 * <Editor.Root>
 *   <Editor.Canvas>
 *     <Editor.Section />
 *     <MiniZoom />
 *   </Editor.Canvas>
 * </Editor.Root>
 * ```
 */
export function useEditorZoom(): UseEditorZoomResult {
    const { zoom, minZoom, maxZoom, zoomIn, zoomOut, reset } = useEditorCanvas();
    return {
        scale: zoom,
        minScale: minZoom,
        maxScale: maxZoom,
        zoomIn,
        zoomOut,
        reset,
        fit: reset,
    };
}
