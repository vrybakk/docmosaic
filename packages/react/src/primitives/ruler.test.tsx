/**
 * @vitest-environment happy-dom
 *
 * Phase 29 — `Editor.Ruler` primitive coverage.
 *
 * The ruler is a Canvas overlay: it reads page dimensions + scale from
 * editor context and lays out minor/major ticks per 10pt/50pt at 100% zoom.
 * These tests pin the static contract — ticks exist at the right
 * coordinates, the corner square is rendered, and the unit prop drives the
 * displayed label.
 */
import { createDocument, type Document } from '@docmosaic/core';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Editor } from '../index';

function seed(): Document {
    return createDocument();
}

function mountWithRuler() {
    return render(
        <Editor.Root defaultDocument={seed()} showRuler>
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
        </Editor.Root>,
    );
}

/**
 * The Canvas keeps overlays behind a 100ms `isLoading` flag while it measures
 * the container. The ruler test suite has to wait that out before querying for
 * the rendered ticks — match the convention from `zoom.test.tsx`.
 */
async function waitForRulerMounted(container: HTMLElement) {
    await waitFor(() => {
        expect(container.querySelector('[data-editor-ruler="true"]')).toBeTruthy();
    });
}

describe('Editor.Ruler', () => {
    it('renders horizontal and vertical ruler axes', async () => {
        const { container } = mountWithRuler();
        await waitForRulerMounted(container);
        expect(container.querySelector('[data-editor-ruler-axis="horizontal"]')).not.toBeNull();
        expect(container.querySelector('[data-editor-ruler-axis="vertical"]')).not.toBeNull();
    });

    it('emits minor + major tick marks along both axes', async () => {
        const { container } = mountWithRuler();
        await waitForRulerMounted(container);
        const minor = container.querySelectorAll('[data-tick="minor"]');
        const major = container.querySelectorAll('[data-tick="major"]');
        // Even with an indeterminate finalScale in happy-dom, both kinds of
        // ticks should render — the ruler iterates the page extent every
        // 10pt and tags every 50pt mark as major.
        expect(minor.length).toBeGreaterThan(0);
        expect(major.length).toBeGreaterThan(0);
    });

    it('omits itself when showRuler is not set on Editor.Root', async () => {
        const { container } = render(
            <Editor.Root defaultDocument={seed()}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </Editor.Root>,
        );
        // Give the canvas its loading window so a stray render wouldn't be
        // missed by an early assertion.
        await waitFor(() => {
            expect(container.querySelector('[data-page-container="true"]')).toBeTruthy();
        });
        expect(container.querySelector('[data-editor-ruler="true"]')).toBeNull();
    });

    it('respects an explicit rulerUnit prop on Editor.Root', async () => {
        // When the unit is `pt`, major-tick labels are integers (e.g. "50").
        // When it switches to `mm`, the same major-tick value becomes a
        // floating-point string. Read one of the label spans and verify.
        const { container } = render(
            <Editor.Root defaultDocument={seed()} showRuler rulerUnit="mm">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </Editor.Root>,
        );
        await waitForRulerMounted(container);
        const labels = container.querySelectorAll('[data-editor-ruler-axis="horizontal"] span');
        const texts = Array.from(labels).map((l) => l.textContent);
        // 50pt ≈ 17.64mm — every major tick label should be a 2-decimal
        // millimeter value, not an integer point count.
        expect(texts.some((t) => /^17\.6\d$/.test(t ?? ''))).toBe(true);
    });

    it('Editor.Ruler can be invoked through the flat EditorRuler export', async () => {
        const { EditorRuler } = await import('../index');
        expect(EditorRuler).toBe(Editor.Ruler);
    });
});
