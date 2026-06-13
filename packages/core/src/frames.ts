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
