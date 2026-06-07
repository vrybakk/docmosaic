/**
 * Document templates: serialize a {@link Document} to JSON and import it back.
 *
 * Templates are full {@link Document} snapshots — the same shape the reducer
 * consumes — so loading a template is just dispatching `UPDATE_DOCUMENT`.
 * Export uses a stable key ordering so two equivalent documents serialize to
 * the same string (handy for snapshot tests and diffing in version control).
 *
 * @packageDocumentation
 */

import type { Document } from './types';

/**
 * A template is a complete {@link Document} value. Aliased so callers reading
 * `template.gallery` style code don't have to import `Document` to talk about
 * a template's runtime shape.
 */
export type DocumentTemplate = Document;

/**
 * Stable-order JSON serializer for a document. Object keys are emitted in the
 * order returned by {@link orderKeys} (top-level fields first, then nested
 * objects), so the same document produces the same bytes across runs.
 *
 * Dates are encoded as ISO strings; that matches what `JSON.stringify` would
 * do anyway but keeps the round-trip explicit. Numbers, strings, booleans, and
 * arrays pass through untouched.
 *
 * @param doc - The document to serialize.
 * @returns The JSON string representation.
 */
export function exportTemplate(doc: Document): string {
    return JSON.stringify(doc, replacer, 2);
}

function replacer(this: unknown, _key: string, value: unknown): unknown {
    if (value instanceof Date) return value.toISOString();
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Re-emit the object with sorted keys so the output is stable.
        const sorted: Record<string, unknown> = {};
        for (const k of Object.keys(value).sort()) {
            sorted[k] = (value as Record<string, unknown>)[k];
        }
        return sorted;
    }
    return value;
}

const TOP_LEVEL_REQUIRED_KEYS = [
    'id',
    'name',
    'sections',
    'createdAt',
    'updatedAt',
    'backgroundPDF',
    'totalPages',
    'currentPage',
    'estimatedSize',
    'pageSize',
    'orientation',
    'pages',
] as const;

/**
 * Parse a template JSON string back into a {@link Document}. Validates that
 * every top-level field expected by the editor is present and rehydrates the
 * `createdAt` / `updatedAt` timestamps from ISO strings.
 *
 * Sections inside the document are passed through untouched — if you import a
 * legacy document missing the section `type` discriminator, run
 * {@link normalizeSection} on each section yourself.
 *
 * @param json - JSON string previously produced by {@link exportTemplate}, or
 * any payload that matches the {@link Document} shape.
 * @returns A {@link Document} value with `Date` instances rehydrated.
 * @throws {Error} When the payload is not valid JSON or is missing a required
 * top-level field. The thrown message names the first missing field.
 */
export function importTemplate(json: string): Document {
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch (error) {
        throw new Error(
            `Failed to parse template JSON: ${(error as Error).message}`,
        );
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Template JSON must decode to an object');
    }
    const obj = parsed as Record<string, unknown>;
    for (const key of TOP_LEVEL_REQUIRED_KEYS) {
        if (!(key in obj)) {
            throw new Error(`Template is missing required field: ${key}`);
        }
    }
    if (!Array.isArray(obj.sections)) {
        throw new Error('Template field "sections" must be an array');
    }
    if (!Array.isArray(obj.pages)) {
        throw new Error('Template field "pages" must be an array');
    }
    const createdAt = new Date(obj.createdAt as string);
    const updatedAt = new Date(obj.updatedAt as string);
    if (Number.isNaN(createdAt.valueOf()) || Number.isNaN(updatedAt.valueOf())) {
        throw new Error('Template createdAt/updatedAt are not valid dates');
    }
    return { ...(obj as unknown as Document), createdAt, updatedAt };
}
