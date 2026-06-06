import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'tsup';

// TODO(phase-7): extend `banner` to inject `"use client";` at the top of files
// emitted from `src/primitives/**`. No primitives exist yet, so this is a no-op.
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', '@docmosaic/core'],
    banner: {},
    onSuccess: async () => {
        const src = resolve(__dirname, 'src/styles.css');
        const dest = resolve(__dirname, 'dist/styles.css');
        if (!existsSync(src)) return;
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(src, dest);
    },
});
