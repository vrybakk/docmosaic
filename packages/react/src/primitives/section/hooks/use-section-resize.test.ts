import { describe, expect, it } from 'vitest';
import { computeResize, type ResizeHandle } from './use-section-resize';

// Starting geometry shared across cases.
// section at (100, 100), 200x200; no image so corners don't lock aspect ratio.
const start = {
    x: 0, // event clientX baseline (unused by compute)
    y: 0,
    width: 200,
    height: 200,
    left: 100,
    top: 100,
};

// With aspectRatio = 1, corner handles keep height = width.
const startWithAspect = { ...start, aspectRatio: 1 };

function run(handle: ResizeHandle, dx: number, dy: number, withAspect = false) {
    return computeResize(withAspect ? startWithAspect : start, handle, dx, dy);
}

describe('computeResize', () => {
    describe('edge handles', () => {
        it('right grows width only', () => {
            expect(run('right', 50, 99)).toEqual({ x: 100, y: 100, width: 250, height: 200 });
        });

        it('left shrinks width and shifts x', () => {
            expect(run('left', 50, 0)).toEqual({ x: 150, y: 100, width: 150, height: 200 });
        });

        it('bottom grows height only', () => {
            expect(run('bottom', 99, 50)).toEqual({ x: 100, y: 100, width: 200, height: 250 });
        });

        it('top shrinks height and shifts y', () => {
            expect(run('top', 0, 50)).toEqual({ x: 100, y: 150, width: 200, height: 150 });
        });
    });

    describe('corner handles without image (free aspect)', () => {
        it('bottomRight grows both width and height', () => {
            expect(run('bottomRight', 50, 30)).toEqual({
                x: 100,
                y: 100,
                width: 250,
                height: 230,
            });
        });

        it('bottomLeft shrinks width (shifts x) and grows height', () => {
            expect(run('bottomLeft', 50, 30)).toEqual({
                x: 150,
                y: 100,
                width: 150,
                height: 230,
            });
        });

        it('topRight grows width and shrinks height (shifts y)', () => {
            expect(run('topRight', 50, 30)).toEqual({
                x: 100,
                y: 130,
                width: 250,
                height: 170,
            });
        });

        it('topLeft shrinks both, shifts x and y', () => {
            expect(run('topLeft', 50, 30)).toEqual({
                x: 150,
                y: 130,
                width: 150,
                height: 170,
            });
        });
    });

    describe('corner handles with aspect lock', () => {
        it('bottomRight keeps aspectRatio = 1', () => {
            const out = run('bottomRight', 50, 0, true);
            expect(out.width).toBe(250);
            expect(out.height).toBe(250);
        });
    });

    describe('minimum size clamp', () => {
        it('right cannot shrink below MIN_SECTION_SIZE (100)', () => {
            // dx = -500 would push width to -300, but it's clamped at 100.
            expect(run('right', -500, 0)).toEqual({ x: 100, y: 100, width: 100, height: 200 });
        });

        it('left clamps width at MIN and shifts x by the clamped delta', () => {
            // dx = 500 would push width to -300; clamped to 100, so x shifts by (200 - 100) = 100.
            expect(run('left', 500, 0)).toEqual({ x: 200, y: 100, width: 100, height: 200 });
        });
    });
});
