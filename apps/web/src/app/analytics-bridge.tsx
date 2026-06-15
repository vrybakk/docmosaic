'use client';

import { setAnalyticsTracker } from '@/lib/analytics';
import { setReactPackageTracker } from '@docmosaic/react';
import { sendGAEvent } from '@next/third-parties/google';

/**
 * Routes analytics events from the web app and `@docmosaic/react` to Google
 * Analytics (loaded in `layout.tsx` via `@next/third-parties/google`).
 *
 * Each wrapper consults its own `currentTracker` and only forwards events in
 * production, so this assignment is safe to run on every client boot.
 *
 * Module-evaluation side effect: runs once per client session when the
 * component is first imported.
 */
const gaTrack = (event: string, payload?: Record<string, unknown>) =>
    sendGAEvent('event', event, payload ?? {});
setAnalyticsTracker(gaTrack);
setReactPackageTracker(gaTrack);

export function AnalyticsBridge() {
    return null;
}
