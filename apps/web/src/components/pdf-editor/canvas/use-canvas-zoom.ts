import { useCallback, useState } from 'react';

interface UseCanvasZoomArgs {
    /** Initial zoom level (defaults to 1). */
    initialZoom?: number;
    /** Minimum zoom level (defaults to 0.5). */
    minZoom?: number;
    /** Maximum zoom level (defaults to 2). */
    maxZoom?: number;
    /** Step applied by zoom in/out buttons (defaults to 0.1). */
    step?: number;
    /** Optional callback fired whenever zoom changes (e.g. for analytics). */
    onZoomChange?: (zoom: number) => void;
}

interface UseCanvasZoomResult {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
    /** Apply a wheel event with ctrl/meta as a zoom delta. No-op otherwise. */
    handleWheel: (e: React.WheelEvent) => void;
}

/**
 * Owns the canvas zoom level and clamps it to [min, max]. Pure UI state — no
 * persistence, no DOM measurement. Callers wire `onZoomChange` for analytics.
 */
export function useCanvasZoom({
    initialZoom = 1,
    minZoom = 0.5,
    maxZoom = 2,
    step = 0.1,
    onZoomChange,
}: UseCanvasZoomArgs = {}): UseCanvasZoomResult {
    const [zoom, setZoom] = useState(initialZoom);

    const updateZoom = useCallback(
        (next: number) => {
            const clamped = Math.min(Math.max(next, minZoom), maxZoom);
            setZoom(clamped);
            onZoomChange?.(clamped);
        },
        [minZoom, maxZoom, onZoomChange],
    );

    const zoomIn = useCallback(() => updateZoom(zoom + step), [zoom, step, updateZoom]);
    const zoomOut = useCallback(() => updateZoom(zoom - step), [zoom, step, updateZoom]);
    const reset = useCallback(() => updateZoom(1), [updateZoom]);

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            updateZoom(zoom + delta);
        },
        [zoom, updateZoom],
    );

    return { zoom, minZoom, maxZoom, zoomIn, zoomOut, reset, handleWheel };
}
