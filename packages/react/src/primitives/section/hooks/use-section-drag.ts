import type { Section } from '@docmosaic/core';
import { useDrag } from '@use-gesture/react';
import { useState } from 'react';

interface UseSectionDragArgs {
    section: Section;
    onUpdate: (section: Section) => void;
    isResizing: boolean;
    /**
     * Group drag hook (Phase 16). When provided and `groupDrag.size > 1`, the
     * section's individual `onUpdate` is bypassed in favour of
     * `groupDrag.onMove(dx, dy)` so the whole selection translates together.
     *
     * Coordinates are in canvas display pixels (matching the input movement),
     * so the receiver converts to PDF points itself.
     */
    groupDrag?: {
        size: number;
        onStart: () => void;
        onMove: (dx: number, dy: number) => void;
        onEnd: () => void;
    };
}

/**
 * Wraps {@link useDrag} so the section orchestrator can stay thin.
 * Position is clamped to the page element matched by `[data-page-container]`,
 * matching the Canvas drop-target wiring. Disabled while resizing.
 *
 * When `groupDrag` is provided and `size > 1`, the move events route to the
 * group handlers (which translate every selected section) instead of the
 * single-section update.
 */
export function useSectionDrag({
    section,
    onUpdate,
    isResizing,
    groupDrag,
}: UseSectionDragArgs) {
    const [isDragging, setIsDragging] = useState(false);

    const bindDrag = useDrag(
        ({ movement: [mx, my], first, active, memo }) => {
            if (isResizing) {
                return false;
            }

            const isGroup = !!groupDrag && groupDrag.size > 1;

            if (first) {
                setIsDragging(true);
                if (isGroup) groupDrag!.onStart();
                return { startX: section.x, startY: section.y };
            }

            if (!active) {
                setIsDragging(false);
                if (isGroup) groupDrag!.onEnd();
                return memo;
            }

            if (isGroup) {
                groupDrag!.onMove(mx, my);
                return memo;
            }

            const pageElement = document.querySelector('[data-page-container]') as HTMLElement | null;
            if (!pageElement) return memo;

            const { startX, startY } = memo || { startX: section.x, startY: section.y };

            const maxX = Math.max(0, pageElement.clientWidth - section.width);
            const maxY = Math.max(0, pageElement.clientHeight - section.height);

            const newX = Math.max(0, Math.min(maxX, startX + mx));
            const newY = Math.max(0, Math.min(maxY, startY + my));

            onUpdate({
                ...section,
                x: Math.round(newX),
                y: Math.round(newY),
            });

            return memo;
        },
        {
            enabled: !isResizing,
            filterTaps: true,
            pointer: { capture: false },
        },
    );

    return { bindDrag, isDragging };
}
