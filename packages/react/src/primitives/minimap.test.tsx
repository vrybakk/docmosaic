/**
 * @vitest-environment happy-dom
 *
 * Phase 29 — `Editor.Minimap` primitive coverage.
 *
 * The minimap is a Canvas overlay: it reads sections + page dimensions
 * from editor context and draws one thumbnail rectangle per section plus a
 * viewport rectangle tracking the parent scroll position. These tests pin
 * the static contract — sections render, the viewport rectangle exists,
 * and the per-type color tags surface through `data-minimap-section`.
 */
import {
    createDocument,
    createSection,
    type Document,
    type ImageSection,
    type ShapeSection,
    type TextSection,
} from '@docmosaic/core';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Editor } from '../index';

function seedWith(sections: Document['sections']): Document {
    return { ...createDocument(), sections };
}

function mountWithMinimap(sections: Document['sections']) {
    return render(
        <Editor.Root defaultDocument={seedWith(sections)} showMinimap>
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
        </Editor.Root>,
    );
}

/**
 * Wait the canvas's 100ms isLoading window out before querying — matches the
 * convention used by `zoom.test.tsx`.
 */
async function waitForMinimapMounted(container: HTMLElement) {
    await waitFor(() => {
        expect(container.querySelector('[data-editor-minimap="true"]')).toBeTruthy();
    });
}

describe('Editor.Minimap', () => {
    it('renders the minimap overlay container', async () => {
        const { container } = mountWithMinimap([]);
        await waitForMinimapMounted(container);
        expect(container.querySelector('[data-editor-minimap="true"]')).not.toBeNull();
    });

    it('does not mount when showMinimap is omitted', async () => {
        const { container } = render(
            <Editor.Root defaultDocument={seedWith([])}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </Editor.Root>,
        );
        await waitFor(() => {
            expect(container.querySelector('[data-page-container="true"]')).toBeTruthy();
        });
        expect(container.querySelector('[data-editor-minimap="true"]')).toBeNull();
    });

    it('draws one thumbnail rectangle per section on the current page', async () => {
        const a = createSection({ x: 10, y: 10, page: 1 }) as ImageSection;
        const b = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
        const { container } = mountWithMinimap([
            { ...a, id: 'a' },
            { ...b, id: 'b' },
        ]);
        await waitForMinimapMounted(container);
        const rects = container.querySelectorAll('[data-minimap-section]');
        expect(rects).toHaveLength(2);
    });

    it('tags each section thumbnail with its section type', async () => {
        const img = createSection({ x: 10, y: 10, page: 1 }) as ImageSection;
        const txt = createSection({ type: 'text', x: 80, y: 10, page: 1 }) as TextSection;
        const shp = createSection({
            type: 'shape',
            shape: 'rect',
            x: 10,
            y: 80,
            page: 1,
        }) as ShapeSection;
        const { container } = mountWithMinimap([
            { ...img, id: 'img' },
            { ...txt, id: 'txt' },
            { ...shp, id: 'shp' },
        ]);
        await waitForMinimapMounted(container);
        const types = Array.from(container.querySelectorAll('[data-minimap-section]')).map((n) =>
            n.getAttribute('data-minimap-section'),
        );
        expect(types.sort()).toEqual(['image', 'shape', 'text']);
    });

    it('renders the viewport rectangle used for panning', async () => {
        const { container } = mountWithMinimap([]);
        await waitForMinimapMounted(container);
        expect(container.querySelector('[data-minimap-viewport="true"]')).not.toBeNull();
    });
});
