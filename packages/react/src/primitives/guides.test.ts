/**
 * Phase 29 — `Editor.Guides` + snap integration.
 *
 * The guide drag gesture itself relies on `pointercapture` + canvas-relative
 * geometry that's awkward to simulate end-to-end inside happy-dom. These
 * tests cover the deterministic seams instead:
 *
 * - The reducer actions are exercised in `packages/core/src/reducer.test.ts`.
 * - The snap helper learns about page guides through `computeSnapTargets`,
 *   so we verify the new `guides` argument adds the expected vertical /
 *   horizontal targets and that {@link computeSnap} sticks a moved group to
 *   them within the documented threshold.
 */
import { describe, expect, it } from 'vitest';
import type { Section } from '@docmosaic/core';
import { computeSnap, computeSnapTargets, SNAP_THRESHOLD } from './canvas/snap';

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

describe('computeSnapTargets — page guides', () => {
    it('adds one vertical target per page guide on the vertical axis', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 600, height: 800 },
            { vertical: [120, 360], horizontal: [] },
        );
        const guideTargets = targets.filter((t) => t.source === 'guide');
        expect(guideTargets).toHaveLength(2);
        expect(guideTargets.every((t) => t.orientation === 'vertical')).toBe(true);
        expect(guideTargets.map((t) => t.position).sort((a, b) => a - b)).toEqual([120, 360]);
    });

    it('adds one horizontal target per page guide on the horizontal axis', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 600, height: 800 },
            { vertical: [], horizontal: [400] },
        );
        const guideTargets = targets.filter((t) => t.source === 'guide');
        expect(guideTargets).toHaveLength(1);
        expect(guideTargets[0].orientation).toBe('horizontal');
        expect(guideTargets[0].position).toBe(400);
    });

    it('passes through unchanged when guides are omitted (back-compat)', () => {
        const before = computeSnapTargets([], new Set(), { width: 600, height: 800 });
        const after = computeSnapTargets([], new Set(), { width: 600, height: 800 }, undefined);
        expect(after).toEqual(before);
    });
});

describe('computeSnap — section sticks to guide', () => {
    it('snaps a section moving past a vertical guide within the SNAP_THRESHOLD', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 1000, height: 1000 },
            { vertical: [300], horizontal: [] },
        );
        const startBBox = { x: 100, y: 100, width: 50, height: 50 };
        // Move the section so its left edge lands at 298 (2pt short of the
        // guide at 300). The snap math should pull it the remaining 2pt.
        const result = computeSnap(startBBox, 198, 0, targets);
        expect(result.dx).toBe(200);
        expect(result.matched.some((t) => t.source === 'guide')).toBe(true);
    });

    it('does not snap when the guide sits outside the SNAP_THRESHOLD', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 1000, height: 1000 },
            { vertical: [300], horizontal: [] },
        );
        const startBBox = { x: 100, y: 100, width: 50, height: 50 };
        // Move just SNAP_THRESHOLD short of the guide so the left edge lands
        // at 300 - SNAP_THRESHOLD - 1 — outside the snap window.
        const result = computeSnap(startBBox, 200 - SNAP_THRESHOLD - 1, 0, targets);
        expect(result.dx).toBe(200 - SNAP_THRESHOLD - 1);
        expect(result.matched.some((t) => t.source === 'guide')).toBe(false);
    });

    it('snaps the right edge to a vertical guide when within threshold', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 1000, height: 1000 },
            { vertical: [200], horizontal: [] },
        );
        // startBBox at x=100, width 50 → right edge at 150. To land the
        // right edge on the guide at 200, move +50. Aim for +48 (right edge
        // at 198 — 2pt off, within threshold).
        const startBBox = { x: 100, y: 100, width: 50, height: 50 };
        const result = computeSnap(startBBox, 48, 0, targets);
        expect(result.dx).toBe(50);
    });

    it('snaps a section vertically to a horizontal guide', () => {
        const targets = computeSnapTargets(
            [],
            new Set(),
            { width: 1000, height: 1000 },
            { vertical: [], horizontal: [400] },
        );
        const startBBox = { x: 100, y: 100, width: 50, height: 50 };
        // Move top edge to 398 (2pt below threshold).
        const result = computeSnap(startBBox, 0, 298, targets);
        expect(result.dy).toBe(300);
        expect(result.matched.some((t) => t.source === 'guide')).toBe(true);
    });

    it('still snaps to non-guide targets when no guides are present', () => {
        const targets = computeSnapTargets([s('peer', 200, 0, 100, 100)], new Set(), {
            width: 1000,
            height: 1000,
        });
        const startBBox = { x: 100, y: 100, width: 50, height: 50 };
        const result = computeSnap(startBBox, 102, 0, targets);
        expect(result.dx).toBe(100);
        expect(result.matched.some((t) => t.source === 'guide')).toBe(false);
    });
});
