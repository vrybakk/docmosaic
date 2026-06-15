'use client';

import { Editor } from '@docmosaic/react';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Client boundary for the editor.
 *
 * `Editor` is a namespace object exported from `@docmosaic/react`. Next.js
 * client-reference proxies don't support property access from a Server
 * Component (`Editor.Root` reads `undefined` on the proxy), so we mount it
 * here in a Client Component while the page itself stays server-rendered
 * for metadata + JSON-LD.
 *
 * `Editor.Root` with no children renders the full resizable app-shell out of
 * the box; we only forward the display toggles and inject the host
 * theme-toggle (the package never imports `next-themes` itself).
 */
export function EditorMount() {
    return <Editor.Root showRuler showMinimap themeToggle={<ThemeToggle />} />;
}
