import { describe, expect, it } from 'vitest';
import { createDocument, createSection } from './factories';
import { exportTemplate, importTemplate } from './templates';
import type { Document, ImageSection } from './types';

const FIXED_DATE = new Date('2025-06-07T00:00:00.000Z');

function buildDoc(): Document {
    const base = createDocument();
    const section = createSection({ x: 50, y: 50, page: 1 }) as ImageSection;
    return {
        ...base,
        id: 'doc-1',
        name: 'Template doc',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        sections: [{ ...section, id: 'sec-1', imageUrl: 'data:image/png;base64,abc' }],
    };
}

describe('templates', () => {
    it('exports a stable JSON string for a document', () => {
        const doc = buildDoc();
        const json = exportTemplate(doc);
        // Re-running should produce the same bytes — the serializer is stable.
        expect(exportTemplate(doc)).toBe(json);
    });

    it('round-trips: importTemplate(exportTemplate(doc)) preserves the document', () => {
        const doc = buildDoc();
        const json = exportTemplate(doc);
        const restored = importTemplate(json);
        expect(restored.id).toBe(doc.id);
        expect(restored.name).toBe(doc.name);
        expect(restored.sections).toEqual(doc.sections);
        expect(restored.pages).toEqual(doc.pages);
        expect(restored.pageSize).toBe(doc.pageSize);
        expect(restored.orientation).toBe(doc.orientation);
        expect(restored.createdAt.toISOString()).toBe(doc.createdAt.toISOString());
        expect(restored.updatedAt.toISOString()).toBe(doc.updatedAt.toISOString());
        // Dates rehydrate as Date instances, not strings.
        expect(restored.createdAt).toBeInstanceOf(Date);
        expect(restored.updatedAt).toBeInstanceOf(Date);
    });

    it('throws on invalid JSON', () => {
        expect(() => importTemplate('not json')).toThrow(/Failed to parse template JSON/);
    });

    it('throws on missing required field', () => {
        const doc = buildDoc();
        const parsed = JSON.parse(exportTemplate(doc));
        delete parsed.pages;
        expect(() => importTemplate(JSON.stringify(parsed))).toThrow(
            /missing required field: pages/,
        );
    });

    it('throws when sections is not an array', () => {
        const doc = buildDoc();
        const parsed = JSON.parse(exportTemplate(doc));
        parsed.sections = 'oops';
        expect(() => importTemplate(JSON.stringify(parsed))).toThrow(/sections.*array/);
    });

    it('throws when payload is not an object', () => {
        expect(() => importTemplate('[1, 2, 3]')).toThrow(/decode to an object/);
        expect(() => importTemplate('"a string"')).toThrow(/decode to an object/);
    });
});
