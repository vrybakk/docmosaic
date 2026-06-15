'use client';

import { setAnalyticsTracker } from '@/lib/analytics';
import { setReactPackageTracker } from '@docmosaic/react';
import { track } from '@vercel/analytics';

/**
 * Wires the Vercel `track` function as the active analytics tracker for both
 * the web app and `@docmosaic/react`.
 *
 * This is the single boot point that couples the app to `@vercel/analytics`.
 * Each wrapper consults its own `currentTracker` and only forwards events in
 * production, so this assignment is safe to run on every client boot.
 *
 * Module-evaluation side effect: runs once per client session when the
 * component is first imported.
 */
const vercelTrack = (event: string, payload?: Record<string, unknown>) =>
    track(event, payload as Parameters<typeof track>[1]);
setAnalyticsTracker(vercelTrack);
setReactPackageTracker(vercelTrack);

export function AnalyticsBridge() {
    return null;
}
