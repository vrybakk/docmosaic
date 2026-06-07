import { describe, expect, it } from 'vitest';
import { computeGroupResize, mapSectionToBBox } from './selection-bounds';

describe('computeGroupResize', () => {
    const start = { x: 100, y: 100, width: 200, height: 200 };

    it('extends width when dragging the right handle', () => {
        expect(computeGroupResize(start, 'right', 50, 0)).toEqual({
            x: 100,
            y: 100,
            width: 250,
            height: 200,
        });
    });

    it('extends height when dragging the bottom handle', () => {
        expect(computeGroupResize(start, 'bottom', 0, 80)).toEqual({
            x: 100,
            y: 100,
            width: 200,
            height: 280,
        });
    });

    it('left handle moves x and shrinks width', () => {
        expect(computeGroupResize(start, 'left', 30, 0)).toEqual({
            x: 130,
            y: 100,
            width: 170,
            height: 200,
        });
    });

    it('corner handle changes both axes independently', () => {
        expect(computeGroupResize(start, 'bottomRight', 40, 30)).toEqual({
            x: 100,
            y: 100,
            width: 240,
            height: 230,
        });
    });

    it('respects the minimum size floor', () => {
        const next = computeGroupResize(start, 'right', -500, 0, 50);
        expect(next.width).toBe(50);
    });
});

describe('mapSectionToBBox', () => {
    const startBBox = { x: 0, y: 0, width: 100, height: 100 };

    it('scales coordinates proportionally to the new bbox', () => {
        const next = mapSectionToBBox(
            { x: 0, y: 0, width: 50, height: 50 },
            startBBox,
            { x: 0, y: 0, width: 200, height: 100 },
        );
        expect(next).toEqual({ x: 0, y: 0, width: 100, height: 50 });
    });

    it('offsets the section when the group bbox translates', () => {
        const next = mapSectionToBBox(
            { x: 50, y: 50, width: 25, height: 25 },
            startBBox,
            { x: 100, y: 100, width: 100, height: 100 },
        );
        expect(next).toEqual({ x: 150, y: 150, width: 25, height: 25 });
    });

    it('treats a zero-width start bbox as identity on that axis', () => {
        const next = mapSectionToBBox(
            { x: 5, y: 5, width: 10, height: 10 },
            { x: 0, y: 0, width: 0, height: 100 },
            { x: 0, y: 0, width: 100, height: 50 },
        );
        // x stays put (no scale), y shrinks 2x.
        expect(next.width).toBe(10);
        expect(next.height).toBe(5);
    });
});
