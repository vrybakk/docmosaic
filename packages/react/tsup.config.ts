import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'tsup';

/**
 * Inject `'use client';` only into the published bundle entry chunks that need
 * it.
 *
 * The bundle re-exports {@link Editor.Root} and the surrounding compound API,
 * all of which transitively rely on React hooks, contexts, and DOM event
 * handlers, so the single entry chunk (`index.js` / `index.cjs`) must be a
 * client module when imported from a React Server Component.
 *
 * Files that are pure (no hooks, no event handlers, no browser APIs, no
 * Context — e.g. `editor-layout.tsx`, the type-only helpers in `internal/`,
 * pure presentational primitives like `section-upload-progress.tsx`) omit the
 * source-level directive — they're harmless inside the client bundle but
 * remain importable from server components when consumed in source form
 * (e.g. inside this repo).
 *
 * The banner is a function so we can keep the per-chunk decision visible if
 * tsup later splits the build into multiple entry points (e.g. a headless
 * `/headless` export that drops the client directive entirely).
 */
function shouldBeClient(chunkPath: string): boolean {
    // Only the published JS entry chunks ship as React client modules.
    // Source maps and type declarations don't need the directive.
    return /\.(c?js)$/.test(chunkPath);
}

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', '@docmosaic/core'],
    banner: (ctx) => {
        // ctx.format is 'esm' | 'cjs' | 'iife' — both 'esm' and 'cjs' produce
        // entry chunks that must be client modules; iife is not configured.
        if (shouldBeClient(`index.${ctx.format === 'cjs' ? 'cjs' : 'js'}`)) {
            return { js: '"use client";' };
        }
        return {};
    },
    onSuccess: async () => {
        // CSS files ship as static assets alongside the JS bundle. Keep the
        // src/ -> dist/ layout identical so `./styles/base.css` and
        // `./styles/themes/docmosaic.css` resolve correctly through the
        // package.json exports map.
        const cssFiles = [
            'styles.css',
            'styles/base.css',
            'styles/themes/docmosaic.css',
            'styles/themes/minimal-dark.css',
            'styles/themes/minimal-light.css',
        ];
        for (const relPath of cssFiles) {
            const src = resolve(__dirname, 'src', relPath);
            const dest = resolve(__dirname, 'dist', relPath);
            if (!existsSync(src)) continue;
            mkdirSync(dirname(dest), { recursive: true });
            copyFileSync(src, dest);
        }
    },
});
