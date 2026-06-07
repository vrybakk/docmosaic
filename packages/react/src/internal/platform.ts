/**
 * @packageDocumentation
 *
 * Tiny browser-only helpers shared between primitives that need to know which
 * platform the user is on (e.g. to render `⌘` on Mac and `Ctrl` elsewhere).
 */

/**
 * Best-effort macOS detection. Returns `false` outside the browser so callers
 * can safely call this during SSR — they'll get the same default platform as a
 * non-Mac user, then re-render on the client when the real value lands.
 */
export function isMacPlatform(): boolean {
    if (typeof navigator === 'undefined') return false;
    const platform =
        (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
            ?.platform ?? navigator.platform;
    return /mac|iphone|ipad|ipod/i.test(platform ?? '');
}
