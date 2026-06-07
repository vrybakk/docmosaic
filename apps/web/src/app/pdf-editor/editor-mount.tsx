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
 *
 * The composition below is the canonical compound tree advertised in the
 * package docs: pass the named buttons/selects as children and the
 * Inspector/Toolbar primitives fall back to their default layouts.
 */
export function EditorMount() {
    return (
        <Editor.Root>
            <Editor.Inspector />
            <Editor.Toolbar />
            <Editor.Pages />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
            <Editor.Preview />
        </Editor.Root>
    );
}
