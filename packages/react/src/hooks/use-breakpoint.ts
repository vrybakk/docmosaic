import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const QUERY_TABLET = '(min-width: 640px)';
const QUERY_DESKTOP = '(min-width: 1024px)';

function readBreakpoint(): Breakpoint {
    if (typeof window === 'undefined' || !window.matchMedia) return 'desktop';
    if (window.matchMedia(QUERY_DESKTOP).matches) return 'desktop';
    if (window.matchMedia(QUERY_TABLET).matches) return 'tablet';
    return 'mobile';
}

export interface BreakpointState {
    breakpoint: Breakpoint;
    isMobile: boolean;
    isTablet: boolean;
    /** Tablet or phone — anything below the desktop breakpoint. */
    isCompact: boolean;
    isDesktop: boolean;
}

/**
 * SSR-safe viewport breakpoint for the editor's responsive layout and touch
 * affordances. Defaults to `desktop` on the server pass (so the full layout
 * renders before hydration) and corrects on mount. Breakpoints:
 * `mobile` < 640px ≤ `tablet` < 1024px ≤ `desktop`.
 */
export function useBreakpoint(): BreakpointState {
    // Always start at `desktop` so the server pass and the first client render
    // agree (no hydration mismatch), then correct to the real breakpoint in the
    // mount effect. On a phone that means one frame of the desktop shell before
    // the mobile layout swaps in — an acceptable trade for SSR safety.
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

    useEffect(() => {
        const update = () => setBreakpoint(readBreakpoint());
        update();
        const tablet = window.matchMedia(QUERY_TABLET);
        const desktop = window.matchMedia(QUERY_DESKTOP);
        tablet.addEventListener('change', update);
        desktop.addEventListener('change', update);
        return () => {
            tablet.removeEventListener('change', update);
            desktop.removeEventListener('change', update);
        };
    }, []);

    return {
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isCompact: breakpoint !== 'desktop',
        isDesktop: breakpoint === 'desktop',
    };
}
