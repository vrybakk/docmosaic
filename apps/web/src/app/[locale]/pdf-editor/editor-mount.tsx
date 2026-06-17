'use client';

import { Editor } from '@docmosaic/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';

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
 * the box; we only forward the display toggles and inject a locale-aware
 * "back to site" link into the top-bar leading slot.
 */
function BackToSite() {
    return (
        <Link
            href="/"
            aria-label="Back to DocMosaic"
            title="Back to DocMosaic"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to DocMosaic</span>
        </Link>
    );
}

export function EditorMount() {
    return <Editor.Root showRuler showMinimap leadingSlot={<BackToSite />} />;
}
