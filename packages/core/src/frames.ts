/**
 * Container-frame helpers. Pure, framework-agnostic logic shared by the editor
 * (drag-end adoption) so the same containment rule is testable without a DOM.
 *
 * @packageDocumentation
 */

import type { Section } from './types';

/**
 * Resolve which container frame a section belongs to, by center-point
 * containment.
 *
 * @remarks
 * Returns the id of the top-most (highest `zIndex`) {@link FrameSection} on the
 * section's page whose box contains the section's center, or `undefined` when
 * the section sits outside every frame. Frames and drawings never become
 * children, so they always resolve to `undefined`. Self is excluded.
 *
 * Used at drag-end to adopt a dropped section into a frame, or release it when
 * dragged out of every frame.
 *
 * @param target - The section whose parent frame is being resolved.
 * @param sections - The full flat section list (across the page).
 * @returns The containing frame's id, or `undefined` when there is none.
 */
export function resolveFrameParent(target: Section, sections: Section[]): string | undefined {
    if (target.type === 'frame' || target.type === 'drawing') return undefined;
    const cx = target.x + target.width / 2;
    const cy = target.y + target.height / 2;
    let best: Section | undefined;
    for (const frame of sections) {
        if (frame.type !== 'frame' || frame.page !== target.page || frame.id === target.id) {
            continue;
        }
        const inside =
            cx >= frame.x &&
            cx <= frame.x + frame.width &&
            cy >= frame.y &&
            cy <= frame.y + frame.height;
        if (!inside) continue;
        if (!best || (frame.zIndex ?? 0) >= (best.zIndex ?? 0)) best = frame;
    }
    return best?.id;
}

/**
 * Render rank used as a layering tiebreak: a {@link FrameSection} is a
 * backdrop / grouping box, so it must draw *behind* the non-frame sections it
 * contains. `0` sorts first (back), `1` sorts later (front).
 */
function frameRank(section: Section): number {
    return section.type === 'frame' ? 0 : 1;
}

/**
 * Order a page's sections back-to-front for rendering — the single source of
 * truth shared by the canvas, the PDF generator, and the PNG generator so all
 * three paint in the same order.
 *
 * @remarks
 * Sort keys, in order: `zIndex` ascending (lower draws first/behind), then
 * frames before non-frames at equal `zIndex` (so a filled or bordered frame
 * sits behind its children instead of covering them), then the original array
 * order as a stable tiebreak.
 *
 * Pass a list already filtered to a single page (and to visible sections). The
 * frame-rank tiebreak only reorders when a frame shares a `zIndex` with a
 * non-frame, so documents without frames keep their exact prior order — which
 * keeps the PDF byte-diff fixtures stable.
 */
export function orderSectionsForRender<T extends Section>(sections: T[]): T[] {
    return sections
        .map((section, index) => ({ section, index }))
        .sort(
            (a, b) =>
                (a.section.zIndex ?? 0) - (b.section.zIndex ?? 0) ||
                frameRank(a.section) - frameRank(b.section) ||
                a.index - b.index,
        )
        .map((entry) => entry.section);
}
