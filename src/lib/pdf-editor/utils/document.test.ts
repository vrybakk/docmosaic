import { describe, expect, it } from 'vitest';
import { createInitialDocument, createNewImageSection } from './document';

describe('createInitialDocument', () => {
    it('returns a document with stable shape and default values', () => {
        const doc = createInitialDocument();

        expect(typeof doc.id).toBe('string');
        expect(doc.id.length).toBeGreaterThan(0);
        expect(typeof doc.name).toBe('string');
        expect(Array.isArray(doc.sections)).toBe(true);
        expect(Array.isArray(doc.pages)).toBe(true);
        expect(doc.pages).toHaveLength(1);
        expect(doc.pageSize).toBe('A4');
        expect(doc.orientation).toBe('portrait');
    });
});

describe('createNewImageSection', () => {
    it('converts pixel coordinates to PDF points (72 DPI)', () => {
        const section = createNewImageSection(96, 192, 2);

        // px * (72 / 96) — 96px == 72pt, 192px == 144pt
        expect(section.x).toBeCloseTo(72, 5);
        expect(section.y).toBeCloseTo(144, 5);
        expect(section.page).toBe(2);
        expect(typeof section.id).toBe('string');
        expect(section.id.length).toBeGreaterThan(0);
        expect(section.width).toBeGreaterThan(0);
        expect(section.height).toBeGreaterThan(0);
    });
});
