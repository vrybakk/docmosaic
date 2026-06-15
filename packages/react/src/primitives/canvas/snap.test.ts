import { describe, expect, it } from 'vitest';
import {
    bboxesIntersect,
    computeGroupBBox,
    computeSnap,
    computeSnapTargets,
    SNAP_THRESHOLD,
} from './snap';
import type { Section } from '@docmosaic/core';

/**
 * Build a minimal Section for snap calculations — only the geometry fields are
 * read by the helpers so the discriminator + rest can be elided with `as`.
 */
function s(id: string, x: number, y: number, width: number, height: number): Section {
    return {
        id,
        type: 'image',
        page: 1,
        x,
        y,
        width,
        height,
        zIndex: 0,
        imageUrl: undefined,
    } as unknown as Section;
}

describe('computeSnapTargets', () => {
    it('returns the 6 page margins / midlines plus 6 edges per non-selected section', () => {
        const sections = [s('a', 0, 0, 100, 100), s('b', 200, 200, 50, 50)];
        const targets = computeSnapTargets(sections, new Set(), { width: 600, height: 800 });
        // 6 page + 6 per section * 2 sections = 18.
        expect(targets).toHaveLength(6 + 6 * 2);

        const verticalPositions = targets
            .filter((t) => t.orientation === 'vertical')
            .map((t) => t.position)
            .sort((a, b) => a - b);
        // Page-left, page-center, page-right plus three edges per section.
        expect(verticalPositions).toContain(0); // page-left, section-left A
        expect(verticalPositions).toContain(300); // page-center
        expect(verticalPositions).toContain(600); // page-right
        expect(verticalPositions).toContain(50); // A center
        expect(verticalPositions).toContain(100); // A right
        expect(verticalPositions).toContain(200); // B left
        expect(verticalPositions).toContain(225); // B center
        expect(verticalPositions).toContain(250); // B right
    });

    it('omits sections that are in the selected set (the moving group)', () => {
        const sections = [s('a', 0, 0, 100, 100), s('b', 200, 200, 50, 50)];
        const targets = computeSnapTargets(sections, new Set(['a']), {
            width: 600,
            height: 800,
        });
        // 6 page + 6 for B only.
        expect(targets).toHaveLength(6 + 6);
    });

    it('returns just the page targets when no other sections exist', () => {
        const targets = computeSnapTargets([], new Set(), { width: 400, height: 600 });
        expect(targets).toHaveLength(6);
    });
});

describe('computeSnap', () => {
    const startBBox = { x: 100, y: 100, width: 50, height: 50 };

    it('returns the input translation unchanged when no targets are within threshold', () => {
        // Big page so the center/edges sit far from the projected bbox.
        const targets = computeSnapTargets([], new Set(), { width: 10000, height: 10000 });
        const result = computeSnap(startBBox, 300, 400, targets);
        expect(result.dx).toBe(300);
        expect(result.dy).toBe(400);
        expect(result.matched).toEqual([]);
    });

    it('snaps the left edge to a candidate within threshold', () => {
        const targets = computeSnapTargets([s('a', 200, 0, 100, 100)], new Set(), {
            width: 1000,
            height: 1000,
        });
        // Moving by 102 places the left edge at 202, which is within 2px of
        // the 'section-left' candidate at 200 — should snap exactly.
        const result = computeSnap(startBBox, 102, 0, targets);
        expect(result.dx).toBe(100);
        // Only a horizontal target should have matched (the y target for y=0
        // is at distance 100 which is outside threshold).
        expect(result.matched.length).toBeGreaterThan(0);
        expect(result.matched.some((t) => t.orientation === 'vertical')).toBe(true);
    });

    it('snaps the right edge of the group to a section left', () => {
        // Group ends at x=150. To align to a candidate at x=200 (section
        // 'a' at x=200), we move by ~52. That puts the right edge at 202 —
        // 2px out, within threshold.
        const targets = computeSnapTargets([s('a', 200, 0, 100, 100)], new Set(), {
            width: 1000,
            height: 1000,
        });
        const result = computeSnap(startBBox, 52, 0, targets);
        expect(result.dx).toBe(50);
    });

    it('does not snap when the closest target sits beyond threshold', () => {
        const targets = computeSnapTargets([s('a', 500, 0, 100, 100)], new Set(), {
            width: 1000,
            height: 1000,
        });
        const result = computeSnap(startBBox, 50, 0, targets);
        expect(result.dx).toBe(50);
        expect(result.matched.filter((t) => t.orientation === 'vertical')).toHaveLength(0);
    });

    it('threshold is configurable', () => {
        const targets = computeSnapTargets([], new Set(), { width: 1000, height: 1000 });
        // Left edge is at 100 + 8 = 108, page-left target is at 0 — distance 108,
        // outside default threshold but inside a custom 200 threshold.
        const result = computeSnap(startBBox, -100 + 8, 0, targets, 200);
        expect(result.dx).toBe(-100);
    });
});

describe('computeGroupBBox', () => {
    it('returns null for an empty section list', () => {
        expect(computeGroupBBox([])).toBeNull();
    });

    it('encloses every section', () => {
        const bbox = computeGroupBBox([s('a', 10, 20, 50, 60), s('b', 100, 30, 20, 80)]);
        expect(bbox).toEqual({ x: 10, y: 20, width: 110, height: 90 });
    });

    it('matches the section bbox when a single section is selected', () => {
        const bbox = computeGroupBBox([s('a', 5, 7, 30, 40)]);
        expect(bbox).toEqual({ x: 5, y: 7, width: 30, height: 40 });
    });
});

describe('bboxesIntersect', () => {
    const base = { x: 0, y: 0, width: 100, height: 100 };

    it('returns true when boxes overlap', () => {
        expect(bboxesIntersect(base, { x: 50, y: 50, width: 100, height: 100 })).toBe(true);
    });

    it('returns false when boxes are fully disjoint', () => {
        expect(bboxesIntersect(base, { x: 200, y: 0, width: 50, height: 50 })).toBe(false);
        expect(bboxesIntersect(base, { x: 0, y: 200, width: 50, height: 50 })).toBe(false);
    });
});

describe('SNAP_THRESHOLD', () => {
    it('is the documented 5px constant', () => {
        expect(SNAP_THRESHOLD).toBe(5);
    });
});
