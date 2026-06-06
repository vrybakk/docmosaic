'use client';

import { setAnalyticsTracker } from '@/lib/analytics';
import { track } from '@vercel/analytics';

/**
 * Wires the Vercel `track` function as the active analytics tracker.
 *
 * This is the single boot point that couples the app to `@vercel/analytics`.
 * The wrapper in `@/lib/analytics` consults `currentTracker` and only
 * forwards events in production, so this assignment is safe to run on every
 * client boot.
 *
 * Module-evaluation side effect: runs once per client session when the
 * component is first imported.
 */
setAnalyticsTracker((event, payload) => track(event, payload));

export function AnalyticsBridge() {
    return null;
}
