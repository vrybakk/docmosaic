import { describe, expect, it } from 'vitest';
import { createDocument, createPage, createSection } from './factories';
import { reducer, type State } from './reducer';
import type { Section, Stroke } from './types';

const FIXED_NOW = new Date('2026-01-01T00:00:00.000Z');

/**
 * Build a fixture with 2 pages and 3 sections distributed across them.
 * The returned state is deep-frozen so any accidental mutation throws.
 */
function buildFixture(): State {
    const doc = createDocument();
    const page2 = createPage();
    const s1 = { ...createSection({ x: 10, y: 10, page: 1 }), id: 'sec-1' };
    const s2 = { ...createSection({ x: 20, y: 20, page: 1 }), id: 'sec-2' };
    const s3 = { ...createSection({ x: 30, y: 30, page: 2 }), id: 'sec-3' };

    const state: State = {
        ...doc,
        pages: [doc.pages[0], page2],
        sections: [s1, s2, s3],
        totalPages: 2,
        currentPage: 1,
    };

    return deepFreeze(state);
}

function deepFreeze<T>(value: T): T {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (const key of Object.keys(value as object)) {
            deepFreeze((value as Record<string, unknown>)[key]);
        }
    }
    return value;
}

/**
 * Take a structural snapshot of `state` for before/after equality checks.
 * Date objects are normalized to ISO strings so freshly-stamped `updatedAt`
 * doesn't leak between snapshots.
 */
function snapshot(state: State): string {
    return JSON.stringify(state, (_, v) => (v instanceof Date ? v.toISOString() : v));
}

describe('reducer', () => {
    it('UPDATE_DOCUMENT merges partial updates and bumps updatedAt', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'UPDATE_DOCUMENT',
            updates: { name: 'Renamed', estimatedSize: 42 },
            now: FIXED_NOW,
        });

        expect(next.name).toBe('Renamed');
        expect(next.estimatedSize).toBe(42);
        expect(next.updatedAt).toEqual(FIXED_NOW);
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_NAME sets the document name', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'UPDATE_NAME', name: 'Spec', now: FIXED_NOW });

        expect(next.name).toBe('Spec');
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_PAGE_SIZE swaps the page size', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'UPDATE_PAGE_SIZE', pageSize: 'LETTER', now: FIXED_NOW });

        expect(next.pageSize).toBe('LETTER');
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_ORIENTATION swaps the orientation', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'UPDATE_ORIENTATION',
            orientation: 'landscape',
            now: FIXED_NOW,
        });

        expect(next.orientation).toBe('landscape');
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_ESTIMATED_SIZE writes the estimated size', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'UPDATE_ESTIMATED_SIZE', size: 1024, now: FIXED_NOW });

        expect(next.estimatedSize).toBe(1024);
        expect(snapshot(state)).toBe(before);
    });

    it('CHANGE_PAGE updates currentPage', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'CHANGE_PAGE', pageNumber: 2, now: FIXED_NOW });

        expect(next.currentPage).toBe(2);
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_PAGE appends a page and selects it', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'ADD_PAGE', now: FIXED_NOW });

        expect(next.pages).toHaveLength(3);
        expect(next.totalPages).toBe(3);
        expect(next.currentPage).toBe(3);
        expect(snapshot(state)).toBe(before);
    });

    it('DELETE_PAGE removes the page and remaps sections', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'DELETE_PAGE', pageIndex: 0, now: FIXED_NOW });

        expect(next.pages).toHaveLength(1);
        expect(next.totalPages).toBe(1);
        // Sections previously on page 1 are dropped; section on page 2 moves to page 1.
        expect(next.sections).toHaveLength(1);
        expect(next.sections[0].id).toBe('sec-3');
        expect(next.sections[0].page).toBe(1);
        expect(snapshot(state)).toBe(before);
    });

    it('DELETE_PAGE no-ops on the last remaining page', () => {
        const doc = createDocument();
        const single: State = deepFreeze({
            ...doc,
            sections: [],
            pages: [doc.pages[0]],
            totalPages: 1,
            currentPage: 1,
        });

        const next = reducer(single, { type: 'DELETE_PAGE', pageIndex: 0, now: FIXED_NOW });

        expect(next).toBe(single);
    });

    it('REORDER_PAGES moves a page and remaps section page indices', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'REORDER_PAGES',
            fromIndex: 0,
            toIndex: 1,
            now: FIXED_NOW,
        });

        // Page IDs swap order.
        expect(next.pages[0].id).toBe(state.pages[1].id);
        expect(next.pages[1].id).toBe(state.pages[0].id);
        // Sections previously on page 1 now point to page 2, the page-2 section moves to page 1.
        const byId = (id: string) => next.sections.find((s) => s.id === id);
        expect(byId('sec-1')?.page).toBe(2);
        expect(byId('sec-2')?.page).toBe(2);
        expect(byId('sec-3')?.page).toBe(1);
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_SECTION appends a new section on the current page', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'ADD_SECTION', now: FIXED_NOW });

        expect(next.sections).toHaveLength(state.sections.length + 1);
        expect(next.sections[next.sections.length - 1].page).toBe(state.currentPage);
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_SECTION replaces the matching section by id', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const updated: Section = { ...state.sections[1], x: 999, y: 888 };
        const next = reducer(state, { type: 'UPDATE_SECTION', section: updated, now: FIXED_NOW });

        const found = next.sections.find((s) => s.id === 'sec-2');
        expect(found?.x).toBe(999);
        expect(found?.y).toBe(888);
        expect(next.sections).toHaveLength(state.sections.length);
        expect(snapshot(state)).toBe(before);
    });

    it('DELETE_SECTION drops the matching section', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'DELETE_SECTION', sectionId: 'sec-2', now: FIXED_NOW });

        expect(next.sections).toHaveLength(2);
        expect(next.sections.find((s) => s.id === 'sec-2')).toBeUndefined();
        expect(snapshot(state)).toBe(before);
    });

    it('DUPLICATE_SECTION clones a section with offset position and new id', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const source = state.sections[0];
        const next = reducer(state, {
            type: 'DUPLICATE_SECTION',
            section: source,
            now: FIXED_NOW,
        });

        expect(next.sections).toHaveLength(state.sections.length + 1);
        const clone = next.sections[next.sections.length - 1];
        expect(clone.id).not.toBe(source.id);
        expect(clone.x).toBe(source.x + 20);
        expect(clone.y).toBe(source.y + 20);
        expect(clone.page).toBe(source.page);
        expect(snapshot(state)).toBe(before);
    });

    /**
     * Build a fixture with 3 sections on page 1 carrying distinct zIndex values
     * so the layer actions have non-trivial peers to swap with.
     */
    function buildLayeredFixture(): State {
        const doc = createDocument();
        const s1 = { ...createSection({ x: 10, y: 10, page: 1 }), id: 'sec-1', zIndex: 0 };
        const s2 = { ...createSection({ x: 20, y: 20, page: 1 }), id: 'sec-2', zIndex: 1 };
        const s3 = { ...createSection({ x: 30, y: 30, page: 1 }), id: 'sec-3', zIndex: 2 };

        return deepFreeze({
            ...doc,
            sections: [s1, s2, s3],
            totalPages: 1,
            currentPage: 1,
        });
    }

    it('BRING_TO_FRONT sets the section zIndex to max + 1 on the same page', () => {
        const state = buildLayeredFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'BRING_TO_FRONT',
            sectionId: 'sec-1',
            now: FIXED_NOW,
        });

        const byId = (id: string) => next.sections.find((s) => s.id === id)!;
        expect(byId('sec-1').zIndex).toBe(3);
        expect(byId('sec-2').zIndex).toBe(1);
        expect(byId('sec-3').zIndex).toBe(2);
        expect(snapshot(state)).toBe(before);
    });

    it('SEND_TO_BACK sets the section zIndex to min - 1 on the same page', () => {
        const state = buildLayeredFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'SEND_TO_BACK',
            sectionId: 'sec-3',
            now: FIXED_NOW,
        });

        const byId = (id: string) => next.sections.find((s) => s.id === id)!;
        expect(byId('sec-3').zIndex).toBe(-1);
        expect(byId('sec-1').zIndex).toBe(0);
        expect(byId('sec-2').zIndex).toBe(1);
        expect(snapshot(state)).toBe(before);
    });

    it('MOVE_FORWARD swaps zIndex with the next-higher peer on the same page', () => {
        const state = buildLayeredFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'MOVE_FORWARD',
            sectionId: 'sec-1',
            now: FIXED_NOW,
        });

        const byId = (id: string) => next.sections.find((s) => s.id === id)!;
        // sec-1 (z=0) swaps with sec-2 (z=1, the next higher peer).
        expect(byId('sec-1').zIndex).toBe(1);
        expect(byId('sec-2').zIndex).toBe(0);
        expect(byId('sec-3').zIndex).toBe(2);
        expect(snapshot(state)).toBe(before);
    });

    it('MOVE_FORWARD is a no-op when the section is already on top', () => {
        const state = buildLayeredFixture();
        const next = reducer(state, {
            type: 'MOVE_FORWARD',
            sectionId: 'sec-3',
            now: FIXED_NOW,
        });
        expect(next).toBe(state);
    });

    it('MOVE_BACKWARD swaps zIndex with the next-lower peer on the same page', () => {
        const state = buildLayeredFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'MOVE_BACKWARD',
            sectionId: 'sec-3',
            now: FIXED_NOW,
        });

        const byId = (id: string) => next.sections.find((s) => s.id === id)!;
        // sec-3 (z=2) swaps with sec-2 (z=1, the next lower peer).
        expect(byId('sec-3').zIndex).toBe(1);
        expect(byId('sec-2').zIndex).toBe(2);
        expect(byId('sec-1').zIndex).toBe(0);
        expect(snapshot(state)).toBe(before);
    });

    it('MOVE_BACKWARD is a no-op when the section is already at the bottom', () => {
        const state = buildLayeredFixture();
        const next = reducer(state, {
            type: 'MOVE_BACKWARD',
            sectionId: 'sec-1',
            now: FIXED_NOW,
        });
        expect(next).toBe(state);
    });

    it('layer actions only consider sections on the same page', () => {
        // sec-x is on page 2 with zIndex 100; should not influence the
        // BRING_TO_FRONT result on page 1.
        const state = (() => {
            const doc = createDocument();
            const s1 = { ...createSection({ x: 10, y: 10, page: 1 }), id: 'sec-1', zIndex: 0 };
            const s2 = { ...createSection({ x: 20, y: 20, page: 1 }), id: 'sec-2', zIndex: 1 };
            const sx = { ...createSection({ x: 30, y: 30, page: 2 }), id: 'sec-x', zIndex: 100 };
            return deepFreeze({
                ...doc,
                pages: [...doc.pages, createPage()],
                sections: [s1, s2, sx],
                totalPages: 2,
                currentPage: 1,
            });
        })();

        const next = reducer(state, {
            type: 'BRING_TO_FRONT',
            sectionId: 'sec-1',
            now: FIXED_NOW,
        });

        const byId = (id: string) => next.sections.find((s) => s.id === id)!;
        // Page-1 max was 1, so sec-1 becomes 2 (NOT 101).
        expect(byId('sec-1').zIndex).toBe(2);
        expect(byId('sec-x').zIndex).toBe(100);
    });

    it('ADD_SECTION with sectionType:"text" creates a TextSection carrying defaults', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, { type: 'ADD_SECTION', sectionType: 'text', now: FIXED_NOW });

        expect(next.sections).toHaveLength(state.sections.length + 1);
        const added = next.sections[next.sections.length - 1];
        expect(added.type).toBe('text');
        if (added.type !== 'text') throw new Error('narrowing');
        expect(added.text).toBe('');
        expect(added.fontSize).toBe(16);
        expect(added.align).toBe('left');
        expect(added.color).toBe('rgb(0,0,0)');
        expect(added.page).toBe(state.currentPage);
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_SECTION on a text section replaces only the specified fields', () => {
        const doc = createDocument();
        const text = createSection({ type: 'text', x: 10, y: 10, page: 1 });
        const state: State = deepFreeze({
            ...doc,
            sections: [{ ...text, id: 'text-1' }],
        });
        const before = snapshot(state);

        const original = state.sections[0];
        if (original.type !== 'text') throw new Error('text fixture');
        const updated: Section = { ...original, text: 'Hello', fontSize: 24 };
        const next = reducer(state, { type: 'UPDATE_SECTION', section: updated, now: FIXED_NOW });

        const found = next.sections.find((s) => s.id === 'text-1');
        if (!found || found.type !== 'text') throw new Error('text after update');
        expect(found.text).toBe('Hello');
        expect(found.fontSize).toBe(24);
        // Untouched fields remain.
        expect(found.color).toBe('rgb(0,0,0)');
        expect(found.align).toBe('left');
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_SECTION with sectionType:"shape" creates a ShapeSection carrying defaults', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'ADD_SECTION',
            sectionType: 'shape',
            shape: 'circle',
            now: FIXED_NOW,
        });

        expect(next.sections).toHaveLength(state.sections.length + 1);
        const added = next.sections[next.sections.length - 1];
        expect(added.type).toBe('shape');
        if (added.type !== 'shape') throw new Error('narrowing');
        expect(added.shape).toBe('circle');
        expect(added.stroke).toBe('#000');
        expect(added.strokeWidth).toBe(1);
        expect(added.fill).toBe('transparent');
        expect(added.opacity).toBe(1);
        expect(added.page).toBe(state.currentPage);
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_SECTION shape defaults to rect when no shape is provided', () => {
        const state = buildFixture();
        const next = reducer(state, {
            type: 'ADD_SECTION',
            sectionType: 'shape',
            now: FIXED_NOW,
        });
        const added = next.sections[next.sections.length - 1];
        if (added.type !== 'shape') throw new Error('narrowing');
        expect(added.shape).toBe('rect');
    });

    it('UPDATE_PAGE_BACKGROUND sets the background on the targeted page', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'UPDATE_PAGE_BACKGROUND',
            pageIndex: 1,
            background: { color: 'rgb(240,240,240)' },
            now: FIXED_NOW,
        });

        expect(next.pages[0].background).toBeUndefined();
        expect(next.pages[1].background).toEqual({ color: 'rgb(240,240,240)' });
        expect(next.updatedAt).toEqual(FIXED_NOW);
        expect(snapshot(state)).toBe(before);
    });

    it('UPDATE_PAGE_BACKGROUND accepts an image data URL alongside color', () => {
        const state = buildFixture();
        const next = reducer(state, {
            type: 'UPDATE_PAGE_BACKGROUND',
            pageIndex: 0,
            background: { color: '#fff', image: 'data:image/png;base64,AAA' },
            now: FIXED_NOW,
        });
        expect(next.pages[0].background).toEqual({
            color: '#fff',
            image: 'data:image/png;base64,AAA',
        });
    });

    it('UPDATE_PAGE_BACKGROUND can clear an existing background by passing undefined', () => {
        const state = buildFixture();
        const seeded = reducer(state, {
            type: 'UPDATE_PAGE_BACKGROUND',
            pageIndex: 0,
            background: { color: '#abc' },
            now: FIXED_NOW,
        });
        const cleared = reducer(seeded, {
            type: 'UPDATE_PAGE_BACKGROUND',
            pageIndex: 0,
            background: undefined,
            now: FIXED_NOW,
        });
        expect(cleared.pages[0].background).toBeUndefined();
    });

    it('UPDATE_PAGE_BACKGROUND is a no-op for out-of-range pageIndex', () => {
        const state = buildFixture();
        const next = reducer(state, {
            type: 'UPDATE_PAGE_BACKGROUND',
            pageIndex: 99,
            background: { color: '#abc' },
            now: FIXED_NOW,
        });
        expect(next).toBe(state);
    });

    it('ADD_SECTION with sectionType:"drawing" creates a DrawingSection with empty strokes', () => {
        const state = buildFixture();
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'ADD_SECTION',
            sectionType: 'drawing',
            now: FIXED_NOW,
        });

        expect(next.sections).toHaveLength(state.sections.length + 1);
        const added = next.sections[next.sections.length - 1];
        expect(added.type).toBe('drawing');
        if (added.type !== 'drawing') throw new Error('narrowing');
        expect(added.strokes).toEqual([]);
        expect(added.page).toBe(state.currentPage);
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_STROKE appends a stroke to the targeted drawing section', () => {
        const doc = createDocument();
        const drawing = createSection({ type: 'drawing', page: 1 });
        if (drawing.type !== 'drawing') throw new Error('drawing fixture');
        const state: State = deepFreeze({
            ...doc,
            sections: [{ ...drawing, id: 'draw-1' }],
        });
        const before = snapshot(state);

        const stroke: Stroke = {
            points: [
                { x: 10, y: 10 },
                { x: 20, y: 20 },
            ],
            color: '#000',
            weight: 2,
        };
        const next = reducer(state, {
            type: 'ADD_STROKE',
            sectionId: 'draw-1',
            stroke,
            now: FIXED_NOW,
        });

        const target = next.sections.find((s) => s.id === 'draw-1');
        if (!target || target.type !== 'drawing') throw new Error('drawing after add');
        expect(target.strokes).toHaveLength(1);
        expect(target.strokes[0]).toEqual(stroke);
        expect(next.updatedAt).toEqual(FIXED_NOW);
        expect(snapshot(state)).toBe(before);
    });

    it('ADD_STROKE appends in order across multiple dispatches', () => {
        const doc = createDocument();
        const drawing = createSection({ type: 'drawing', page: 1 });
        if (drawing.type !== 'drawing') throw new Error('drawing fixture');
        const state: State = {
            ...doc,
            sections: [{ ...drawing, id: 'draw-1' }],
        };

        const s1: Stroke = { points: [{ x: 0, y: 0 }], color: '#f00', weight: 1 };
        const s2: Stroke = { points: [{ x: 5, y: 5 }], color: '#0f0', weight: 2 };
        const afterFirst = reducer(state, { type: 'ADD_STROKE', sectionId: 'draw-1', stroke: s1 });
        const afterSecond = reducer(afterFirst, {
            type: 'ADD_STROKE',
            sectionId: 'draw-1',
            stroke: s2,
        });

        const target = afterSecond.sections.find((s) => s.id === 'draw-1');
        if (!target || target.type !== 'drawing') throw new Error('narrowing');
        expect(target.strokes).toEqual([s1, s2]);
    });

    it('ADD_STROKE is a no-op when the target section is not a drawing', () => {
        const state = buildFixture();
        const stroke: Stroke = { points: [{ x: 0, y: 0 }], color: '#000', weight: 1 };
        const next = reducer(state, {
            type: 'ADD_STROKE',
            sectionId: 'sec-1',
            stroke,
            now: FIXED_NOW,
        });
        expect(next).toBe(state);
    });

    it('CLEAR_STROKES empties the target drawing section', () => {
        const doc = createDocument();
        const drawing = createSection({ type: 'drawing', page: 1 });
        if (drawing.type !== 'drawing') throw new Error('drawing fixture');
        const seeded: Section = {
            ...drawing,
            id: 'draw-1',
            strokes: [
                { points: [{ x: 1, y: 1 }], color: '#000', weight: 1 },
                { points: [{ x: 2, y: 2 }], color: '#000', weight: 1 },
            ],
        };
        const state: State = deepFreeze({ ...doc, sections: [seeded] });
        const before = snapshot(state);

        const next = reducer(state, {
            type: 'CLEAR_STROKES',
            sectionId: 'draw-1',
            now: FIXED_NOW,
        });

        const target = next.sections.find((s) => s.id === 'draw-1');
        if (!target || target.type !== 'drawing') throw new Error('drawing after clear');
        expect(target.strokes).toEqual([]);
        expect(next.updatedAt).toEqual(FIXED_NOW);
        expect(snapshot(state)).toBe(before);
    });

    it('CLEAR_STROKES is a no-op when the target section is not a drawing', () => {
        const state = buildFixture();
        const next = reducer(state, {
            type: 'CLEAR_STROKES',
            sectionId: 'sec-1',
            now: FIXED_NOW,
        });
        expect(next).toBe(state);
    });

    /**
     * Mirrors the sort the PDF generator uses: zIndex asc, array index asc.
     * Confirms the action+sort pair produces the expected back-to-front order.
     */
    it('sort by (zIndex asc, array index asc) reflects layer actions', () => {
        const initial = buildLayeredFixture();
        const next = reducer(initial, {
            type: 'BRING_TO_FRONT',
            sectionId: 'sec-1',
        });
        const indexById = new Map(next.sections.map((s, i) => [s.id, i]));
        const sorted = [...next.sections].sort(
            (a, b) => a.zIndex - b.zIndex || indexById.get(a.id)! - indexById.get(b.id)!,
        );
        // After bringing sec-1 to front: order back→front is sec-2, sec-3, sec-1.
        expect(sorted.map((s) => s.id)).toEqual(['sec-2', 'sec-3', 'sec-1']);
    });
});
