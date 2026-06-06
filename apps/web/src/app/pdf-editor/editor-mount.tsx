'use client';

import { Editor } from '@docmosaic/react';

/**
 * Client boundary for the editor.
 *
 * `Editor` is a namespace object exported from `@docmosaic/react`. Next.js
 * client-reference proxies don't support property access from a Server
 * Component (`Editor.Root` reads `undefined` on the proxy), so we mount it
 * here in a Client Component while the page itself stays server-rendered
 * for metadata + JSON-LD.
 */
export function EditorMount() {
    return <Editor.Root />;
}
