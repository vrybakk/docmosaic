import type { ImageSection } from '@/lib/pdf-editor/types';
import { useDrag } from '@use-gesture/react';
import { useState } from 'react';

interface UseSectionDragArgs {
    section: ImageSection;
    onUpdate: (section: ImageSection) => void;
    isResizing: boolean;
}

/**
 * Wraps {@link useDrag} so {@link ImageSection} can stay a thin orchestrator.
 * Position is clamped to the page element matched by `[data-page-container]`,
 * matching the Canvas drop-target wiring. Disabled while resizing.
 */
export function useSectionDrag({ section, onUpdate, isResizing }: UseSectionDragArgs) {
    const [isDragging, setIsDragging] = useState(false);

    const bindDrag = useDrag(
        ({ movement: [mx, my], first, active, memo }) => {
            if (isResizing) {
                return false;
            }

            if (first) {
                setIsDragging(true);
                return { startX: section.x, startY: section.y };
            }

            if (!active) {
                setIsDragging(false);
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
