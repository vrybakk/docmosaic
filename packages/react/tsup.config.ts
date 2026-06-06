import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'tsup';

/**
 * Inject `'use client';` at the top of the emitted bundles so the entire
 * primitive surface is safe to import from a Next.js server component.
 *
 * Phase 7h will narrow this to only the files that actually need it
 * (currently the whole bundle is one client module because Next.js
 * propagates the directive transitively).
 */
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', '@docmosaic/core'],
    banner: {
        js: '"use client";',
    },
    onSuccess: async () => {
        const src = resolve(__dirname, 'src/styles.css');
        const dest = resolve(__dirname, 'dist/styles.css');
        if (!existsSync(src)) return;
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(src, dest);
    },
});
