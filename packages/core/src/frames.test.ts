import { describe, expect, it } from 'vitest';
import { createSection } from './factories';
import { orderSectionsForRender, resolveFrameParent } from './frames';
import type { Section } from './types';

/** Geometry-only overrides — never `type`, so the discriminated union holds. */
type Tweak = { page?: number; zIndex?: number; width?: number; height?: number };

/** A 200×200 frame anchored at (x, y) on `page`. */
function frame(id: string, x: number, y: number, extra: Tweak = {}): Section {
    return {
        ...createSection({ type: 'frame', page: 1 }),
        id,
        x,
        y,
        width: 200,
        height: 200,
        ...extra,
    };
}

/** A 40×40 box at (x, y) whose center is what containment is tested against. */
function box(id: string, x: number, y: number, extra: Tweak = {}): Section {
    return { ...createSection({ page: 1 }), id, x, y, width: 40, height: 40, ...extra };
}

describe('resolveFrameParent', () => {
    it('adopts a section whose center is inside a frame', () => {
        const f = frame('f1', 0, 0);
        const child = box('c', 80, 80); // center (100,100) inside the 0..200 frame
        expect(resolveFrameParent(child, [f, child])).toBe('f1');
    });

    it('returns undefined when the center is outside every frame', () => {
        const f = frame('f1', 0, 0);
        const loose = box('c', 400, 400);
        expect(resolveFrameParent(loose, [f, loose])).toBeUndefined();
    });

    it('picks the top-most frame when frames overlap', () => {
        const back = frame('back', 0, 0, { zIndex: 0 });
        const front = frame('front', 0, 0, { zIndex: 5 });
        const child = box('c', 80, 80);
        expect(resolveFrameParent(child, [back, front, child])).toBe('front');
    });

    it('never adopts across pages', () => {
        const f = frame('f1', 0, 0, { page: 2 });
        const child = box('c', 80, 80, { page: 1 });
        expect(resolveFrameParent(child, [f, child])).toBeUndefined();
    });

    it('frames and drawings are never adopted', () => {
        const f = frame('f1', 0, 0);
        const innerFrame = frame('f2', 80, 80, { width: 20, height: 20 });
        const drawing = { ...createSection({ type: 'drawing', page: 1 }), id: 'd', x: 80, y: 80 };
        expect(resolveFrameParent(innerFrame, [f, innerFrame])).toBeUndefined();
        expect(resolveFrameParent(drawing, [f, drawing])).toBeUndefined();
    });
});

describe('orderSectionsForRender', () => {
    it('draws a frame behind a non-frame at equal zIndex regardless of array order', () => {
        const child = box('child', 80, 80, { zIndex: 0 });
        const f = frame('f', 0, 0, { zIndex: 0 });
        // Frame added AFTER the child (higher array index) — the natural "draw a
        // frame around existing content" flow. It must still render first (behind).
        const order = orderSectionsForRender([child, f]).map((s) => s.id);
        expect(order).toEqual(['f', 'child']);
    });

    it('respects explicit zIndex over the frame tiebreak', () => {
        const child = box('child', 80, 80, { zIndex: 0 });
        const f = frame('f', 0, 0, { zIndex: 5 }); // explicitly brought forward
        expect(orderSectionsForRender([child, f]).map((s) => s.id)).toEqual(['child', 'f']);
    });

    it('preserves original order for documents without frames (byte-diff safety)', () => {
        const a = box('a', 0, 0, { zIndex: 0 });
        const b = box('b', 0, 0, { zIndex: 0 });
        const c = box('c', 0, 0, { zIndex: 0 });
        expect(orderSectionsForRender([a, b, c]).map((s) => s.id)).toEqual(['a', 'b', 'c']);
    });
});
