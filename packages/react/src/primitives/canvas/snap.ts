/**
 * Snap-guide math for multi-select group drag (Phase 16).
 *
 * The canvas calls {@link computeSnapTargets} once per drag start to collect
 * the candidate edges (other sections, page margins, page mid-lines) and then
 * {@link computeSnap} on every move to:
 *
 * 1. Adjust the proposed (dx, dy) translation so any group edge that lands
 *    within {@link SNAP_THRESHOLD} of a candidate sticks to it.
 * 2. Return the matched candidates so the {@link SnapGuides} primitive can
 *    render the visual guide line.
 *
 * Coordinates are in PDF points throughout — the canvas converts back to
 * display pixels for rendering by multiplying with `finalScale`.
 */

import type { Section } from '@docmosaic/core';

/** Pixel distance within which a group edge snaps to a candidate. */
export const SNAP_THRESHOLD = 5;

/** Axis-aligned bounding box in PDF points. */
export interface SnapBBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Vertical snap target (x position). Group's left, center, or right edge can
 * snap to it.
 */
export interface VerticalSnapTarget {
    orientation: 'vertical';
    position: number;
    /** Where this candidate came from — useful for stories / debugging. */
    source: 'section-left' | 'section-right' | 'section-center' | 'page-left' | 'page-right' | 'page-center';
}

/** Horizontal snap target (y position). */
export interface HorizontalSnapTarget {
    orientation: 'horizontal';
    position: number;
    source: 'section-top' | 'section-bottom' | 'section-middle' | 'page-top' | 'page-bottom' | 'page-middle';
}

export type SnapTarget = VerticalSnapTarget | HorizontalSnapTarget;

/**
 * Collect snap candidates for a page. The selected (dragging) ids are skipped
 * because we never want the group to snap to itself.
 */
export function computeSnapTargets(
    sections: ReadonlyArray<Section>,
    selectedIds: ReadonlySet<string>,
    page: { width: number; height: number },
): SnapTarget[] {
    const targets: SnapTarget[] = [
        { orientation: 'vertical', position: 0, source: 'page-left' },
        { orientation: 'vertical', position: page.width, source: 'page-right' },
        { orientation: 'vertical', position: page.width / 2, source: 'page-center' },
        { orientation: 'horizontal', position: 0, source: 'page-top' },
        { orientation: 'horizontal', position: page.height, source: 'page-bottom' },
        { orientation: 'horizontal', position: page.height / 2, source: 'page-middle' },
    ];

    for (const s of sections) {
        if (selectedIds.has(s.id)) continue;
        targets.push(
            { orientation: 'vertical', position: s.x, source: 'section-left' },
            { orientation: 'vertical', position: s.x + s.width, source: 'section-right' },
            {
                orientation: 'vertical',
                position: s.x + s.width / 2,
                source: 'section-center',
            },
            { orientation: 'horizontal', position: s.y, source: 'section-top' },
            { orientation: 'horizontal', position: s.y + s.height, source: 'section-bottom' },
            {
                orientation: 'horizontal',
                position: s.y + s.height / 2,
                source: 'section-middle',
            },
        );
    }

    return targets;
}

/** Result of {@link computeSnap}. */
export interface SnapResult {
    /** The adjusted dx (may equal the input when no snap fired). */
    dx: number;
    /** The adjusted dy. */
    dy: number;
    /** Targets that the group's edges are currently aligned to. */
    matched: SnapTarget[];
}

/**
 * Adjust a translation so that, if any edge of the moved bbox lands within
 * {@link SNAP_THRESHOLD} of a candidate, it snaps to that candidate exactly.
 *
 * Pure function — no side effects, no DOM dependency. Tested directly.
 */
export function computeSnap(
    startBBox: SnapBBox,
    dx: number,
    dy: number,
    targets: ReadonlyArray<SnapTarget>,
    threshold = SNAP_THRESHOLD,
): SnapResult {
    const matched: SnapTarget[] = [];

    // The three candidate x-edges of the moved group: left, center, right.
    const projLeft = startBBox.x + dx;
    const projCenter = startBBox.x + startBBox.width / 2 + dx;
    const projRight = startBBox.x + startBBox.width + dx;

    let bestDx = 0;
    let bestDxDistance = threshold;
    let bestDxTargets: VerticalSnapTarget[] = [];

    for (const t of targets) {
        if (t.orientation !== 'vertical') continue;
        for (const edge of [projLeft, projCenter, projRight]) {
            const distance = Math.abs(edge - t.position);
            if (distance < bestDxDistance) {
                bestDxDistance = distance;
                bestDx = t.position - edge;
                bestDxTargets = [t];
            } else if (distance === bestDxDistance && bestDxDistance < threshold) {
                bestDxTargets.push(t);
            }
        }
    }

    const projTop = startBBox.y + dy;
    const projMiddle = startBBox.y + startBBox.height / 2 + dy;
    const projBottom = startBBox.y + startBBox.height + dy;

    let bestDy = 0;
    let bestDyDistance = threshold;
    let bestDyTargets: HorizontalSnapTarget[] = [];

    for (const t of targets) {
        if (t.orientation !== 'horizontal') continue;
        for (const edge of [projTop, projMiddle, projBottom]) {
            const distance = Math.abs(edge - t.position);
            if (distance < bestDyDistance) {
                bestDyDistance = distance;
                bestDy = t.position - edge;
                bestDyTargets = [t];
            } else if (distance === bestDyDistance && bestDyDistance < threshold) {
                bestDyTargets.push(t);
            }
        }
    }

    matched.push(...bestDxTargets, ...bestDyTargets);

    return {
        dx: dx + bestDx,
        dy: dy + bestDy,
        matched,
    };
}

/**
 * Build the bounding box of a list of sections. Returns `null` for an empty
 * list (caller should treat that as "no selection to drag").
 */
export function computeGroupBBox(sections: ReadonlyArray<Section>): SnapBBox | null {
    if (sections.length === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const s of sections) {
        if (s.x < minX) minX = s.x;
        if (s.y < minY) minY = s.y;
        if (s.x + s.width > maxX) maxX = s.x + s.width;
        if (s.y + s.height > maxY) maxY = s.y + s.height;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Axis-aligned intersection test — used by the canvas marquee to decide which
 * sections fall inside the user's drag box.
 */
export function bboxesIntersect(a: SnapBBox, b: SnapBBox): boolean {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    );
}
