import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCanvasZoom } from './use-canvas-zoom';

describe('useCanvasZoom', () => {
    it('clamps zoom in at maxZoom', () => {
        const { result } = renderHook(() =>
            useCanvasZoom({ initialZoom: 1.95, maxZoom: 2, step: 0.1 }),
        );

        act(() => result.current.zoomIn());
        expect(result.current.zoom).toBe(2);

        act(() => result.current.zoomIn());
        expect(result.current.zoom).toBe(2);
    });

    it('clamps zoom out at minZoom', () => {
        const { result } = renderHook(() =>
            useCanvasZoom({ initialZoom: 0.55, minZoom: 0.5, step: 0.1 }),
        );

        act(() => result.current.zoomOut());
        expect(result.current.zoom).toBeCloseTo(0.5);

        act(() => result.current.zoomOut());
        expect(result.current.zoom).toBeCloseTo(0.5);
    });

    it('reset returns zoom to 1', () => {
        const onZoomChange = vi.fn();
        const { result } = renderHook(() => useCanvasZoom({ initialZoom: 1.5, onZoomChange }));

        act(() => result.current.reset());
        expect(result.current.zoom).toBe(1);
        expect(onZoomChange).toHaveBeenCalledWith(1);
    });
});
