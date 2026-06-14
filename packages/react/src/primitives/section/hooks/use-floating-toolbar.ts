import { useLayoutEffect, useRef, useState, type DependencyList } from 'react';
import { cn } from '../../../internal/utils';

/**
 * Placement logic shared by every per-section floating toolbar (image, text,
 * shape, frame). Floats the toolbar above the box like Figma's format bar, but
 * flips it below when the box sits near the top of the canvas and there's no
 * room above — otherwise the bar would clip into the ruler / top chrome.
 *
 * @param deps - Geometry that should re-trigger the measurement (the box's
 *   x/y/width/height; the text toolbar also passes `fontSize`, which changes the
 *   box height). The measurement also re-runs on window resize.
 */
export function useFloatingToolbar(deps: DependencyList = []) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [placeBelow, setPlaceBelow] = useState(false);
    useLayoutEffect(() => {
        const measure = () => {
            const el = toolbarRef.current;
            if (!el) return;
            // Measure the box (stable), not the toolbar (whose position is what
            // we are deciding) — measuring the toolbar would oscillate.
            const box = el.closest('[data-section="true"]');
            const scroller = el.closest('.overflow-auto');
            if (!box) return;
            const boxTop = box.getBoundingClientRect().top;
            const limit = scroller ? scroller.getBoundingClientRect().top : 0;
            // ~52px ≈ toolbar height + gap. Flip below when there's no room above.
            setPlaceBelow(boxTop - limit < 52);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { toolbarRef, placeBelow };
}

/**
 * Container className shared by every section floating toolbar. Left-aligned to
 * the box and extending rightward so a box at the left edge (the default
 * position) never pushes the bar off-canvas; floats above the box, or below when
 * {@link useFloatingToolbar} decides there's no room. Hidden until hover or
 * selection.
 */
export function floatingToolbarClass(placeBelow: boolean, isSelected: boolean): string {
    return cn(
        'absolute left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
        placeBelow ? 'top-full mt-2' : 'bottom-full mb-2',
        'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
        isSelected && 'opacity-100',
    );
}
