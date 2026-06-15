/**
 * Parses every primitive source file in `@docmosaic/react` via
 * `react-docgen-typescript` and writes a flat
 * `apps/docs/content/primitives/_props.json` artifact consumed by the
 * `<PropTable name="..." />` MDX component.
 *
 * Usage:  bun run scripts/generate-prop-tables.ts
 *
 * The script is best-effort - primitives without explicit `*Props` types or
 * whose component-display-names don't round-trip through docgen are skipped
 * silently. Hand-write a prop table for those by passing `rows` to
 * `<PropTable />`.
 */

import { writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as docgen from 'react-docgen-typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..');
const REACT_SRC = path.join(ROOT, 'packages', 'react', 'src');
const OUT_FILE = path.join(__dirname, '..', 'generated', 'props.json');

interface PropEntry {
    name: string;
    type: string;
    required: boolean;
    defaultValue: string | null;
    description: string;
}

/** JSDoc block tags that mark the end of the summary prose. */
const BLOCK_TAG =
    /\s@(example|param|returns?|see|default|defaultValue|remarks|deprecated|throws|typeParam|template|internal|privateRemarks)\b/i;

/**
 * Reduce a raw JSDoc comment to a concise, table-friendly summary: everything
 * up to the first block tag (`@example`, `@param`, …), with `{@link X}` inline
 * tags resolved to their target/label and whitespace collapsed. Full code
 * examples stay in the prose docs and the source JSDoc - a prop-table cell only
 * needs the summary. Inline `` `code` `` markers are preserved for the renderer.
 */
function cleanDescription(raw: string): string {
    if (!raw) return '';
    const tag = raw.search(BLOCK_TAG);
    const summary = tag >= 0 ? raw.slice(0, tag) : raw;
    return summary
        .replace(/\{@link(?:code|plain)?\s+([^}]+)\}/gi, (_, body: string) => {
            const text = body.trim();
            const piped = text.split('|');
            return piped.length > 1 ? piped[piped.length - 1].trim() : text.split(/\s+/)[0];
        })
        .replace(/\s+/g, ' ')
        .trim();
}

async function walk(dir: string, files: string[] = []): Promise<string[]> {
    const entries = await readdir(dir);
    for (const entry of entries) {
        const full = path.join(dir, entry);
        const s = await stat(full);
        if (s.isDirectory()) {
            await walk(full, files);
        } else if (
            /\.tsx?$/.test(entry) &&
            !entry.endsWith('.test.ts') &&
            !entry.endsWith('.test.tsx')
        ) {
            files.push(full);
        }
    }
    return files;
}

async function main() {
    const tsconfigPath = path.join(ROOT, 'packages', 'react', 'tsconfig.json');
    const parser = docgen.withCustomConfig(tsconfigPath, {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop) => {
            if (prop.parent) {
                return !/node_modules/.test(prop.parent.fileName);
            }
            return true;
        },
    });

    const files = await walk(REACT_SRC);
    const out: Record<string, PropEntry[]> = {};

    for (const file of files) {
        let parsed: docgen.ComponentDoc[] = [];
        try {
            parsed = parser.parse(file);
        } catch {
            continue;
        }
        for (const doc of parsed) {
            const name = doc.displayName;
            if (!name) continue;
            const rows: PropEntry[] = Object.values(doc.props).map((p) => ({
                name: p.name,
                type: p.type?.name ?? 'unknown',
                required: Boolean(p.required),
                defaultValue: p.defaultValue?.value ?? null,
                description: cleanDescription(p.description ?? ''),
            }));
            if (rows.length === 0) continue;
            out[name] = rows;
        }
    }

    await writeFile(OUT_FILE, `${JSON.stringify(out, null, 4)}\n`, 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`Wrote ${Object.keys(out).length} component prop tables to ${OUT_FILE}`);
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
