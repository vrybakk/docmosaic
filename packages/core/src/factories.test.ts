import { describe, expect, it } from 'vitest';
import { createDocument, createSection } from './factories';

describe('createDocument', () => {
    it('returns a document with stable shape and default values', () => {
        const doc = createDocument();

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

describe('createSection', () => {
    it('converts pixel coordinates to PDF points (72 DPI) and defaults to an image section', () => {
        const section = createSection({ x: 96, y: 192, page: 2 });

        // px * (72 / 96) — 96px == 72pt, 192px == 144pt
        expect(section.x).toBeCloseTo(72, 5);
        expect(section.y).toBeCloseTo(144, 5);
        expect(section.page).toBe(2);
        expect(section.type).toBe('image');
        expect(typeof section.id).toBe('string');
        expect(section.id.length).toBeGreaterThan(0);
        expect(section.width).toBeGreaterThan(0);
        expect(section.height).toBeGreaterThan(0);
    });

    it('returns a text section with sensible defaults when type is "text"', () => {
        const section = createSection({ type: 'text', page: 1 });

        expect(section.type).toBe('text');
        if (section.type !== 'text') throw new Error('narrowing');
        expect(section.text).toBe('');
        expect(section.fontSize).toBe(16);
        expect(section.color).toBe('rgb(0,0,0)');
        expect(section.align).toBe('left');
    });

    it('returns a shape section with stroke/fill defaults when type is "shape"', () => {
        const section = createSection({ type: 'shape', shape: 'rect', page: 1 });

        expect(section.type).toBe('shape');
        if (section.type !== 'shape') throw new Error('narrowing');
        expect(section.shape).toBe('rect');
        expect(section.stroke).toBe('#000');
        expect(section.strokeWidth).toBe(1);
        expect(section.fill).toBe('transparent');
        expect(section.opacity).toBe(1);
    });

    it('shape section defaults to rect when no shape is provided', () => {
        const section = createSection({ type: 'shape', page: 1 });
        if (section.type !== 'shape') throw new Error('narrowing');
        expect(section.shape).toBe('rect');
    });

    it('returns a transparent container frame when type is "frame"', () => {
        const section = createSection({ type: 'frame', page: 1 });

        expect(section.type).toBe('frame');
        if (section.type !== 'frame') throw new Error('narrowing');
        expect(section.fill).toBe('transparent');
        expect(section.stroke).toBe('transparent');
        expect(section.strokeWidth).toBe(1);
        expect(section.parentFrameId).toBeUndefined();
    });

    it('stamps maskShape onto an image section (placeholder frame), and omits it otherwise', () => {
        const masked = createSection({ type: 'image', maskShape: 'circle', page: 1 });
        if (masked.type !== 'image') throw new Error('narrowing');
        expect(masked.maskShape).toBe('circle');

        const plain = createSection({ type: 'image', page: 1 });
        if (plain.type !== 'image') throw new Error('narrowing');
        expect(plain.maskShape).toBeUndefined();
    });
});
