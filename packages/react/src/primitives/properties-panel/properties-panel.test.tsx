/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render } from '@testing-library/react';
import {
    createDocument,
    createSection,
    type Document,
    type ImageSection,
    type ShapeSection,
    type TextSection,
} from '@docmosaic/core';
import { describe, expect, it } from 'vitest';
import { useEditor, type EditorContextValue } from '../../context/editor';
import { Editor } from '../../index';

function seedWith(sections: Array<ImageSection | TextSection | ShapeSection>): Document {
    return {
        ...createDocument(),
        sections,
    };
}

function mount(
    sections: Array<ImageSection | TextSection | ShapeSection>,
    initialSelect?: ReadonlyArray<string>,
) {
    let latest: EditorContextValue;
    function Probe() {
        const editor = useEditor();
        latest = editor;
        return null;
    }
    const utils = render(
        <Editor.Root defaultDocument={seedWith(sections)}>
            <Probe />
            <Editor.PropertiesPanel />
        </Editor.Root>,
    );
    if (initialSelect && initialSelect.length > 0) {
        act(() => latest!.ui.selectMany(initialSelect));
    }
    return { ...utils, get: () => latest! };
}

const imageA = createSection({ x: 10, y: 20, page: 1 }) as ImageSection;
const imageB = createSection({ x: 200, y: 30, page: 1 }) as ImageSection;
const textA = createSection({ type: 'text', x: 50, y: 60, page: 1 }) as TextSection;
const shapeA = createSection({
    type: 'shape',
    shape: 'rect',
    x: 60,
    y: 60,
    page: 1,
}) as ShapeSection;

describe('PropertiesPanel', () => {
    it('renders the empty state when no section is selected', () => {
        const { container } = mount([imageA]);
        const emptyState = container.querySelector('[data-properties-empty-state="true"]');
        expect(emptyState).not.toBeNull();
        expect(emptyState?.textContent).toMatch(/Select a section/i);
    });

    it('renders Layout + Layer sub-sections for a single image selection', () => {
        const { container } = mount([imageA], [imageA.id]);
        expect(container.querySelector('input[aria-label="Position X"]')).not.toBeNull();
        expect(container.querySelector('input[aria-label="Position Y"]')).not.toBeNull();
        expect(container.querySelector('input[aria-label="Width"]')).not.toBeNull();
        expect(container.querySelector('input[aria-label="Height"]')).not.toBeNull();
        expect(container.querySelector('button[aria-label="Bring to front"]')).not.toBeNull();
    });

    it('does not render the Text section for a non-text selection', () => {
        const { container } = mount([imageA], [imageA.id]);
        expect(container.querySelector('input[aria-label="Font size"]')).toBeNull();
    });

    it('renders the Text section for a text selection', () => {
        const { container } = mount([textA], [textA.id]);
        const fontSize = container.querySelector(
            'input[aria-label="Font size"]',
        ) as HTMLInputElement | null;
        expect(fontSize).not.toBeNull();
    });

    it('renders the Shape section for a shape selection', () => {
        const { container } = mount([shapeA], [shapeA.id]);
        const strokeWidth = container.querySelector(
            'input[aria-label="Stroke width"]',
        ) as HTMLInputElement | null;
        expect(strokeWidth).not.toBeNull();
    });

    it('commits a layout change on blur and dispatches updateSection', () => {
        const { container, get } = mount([imageA], [imageA.id]);
        const xInput = container.querySelector(
            'input[aria-label="Position X"]',
        ) as HTMLInputElement | null;
        expect(xInput).not.toBeNull();
        if (!xInput) return;

        act(() => {
            fireEvent.change(xInput, { target: { value: '123' } });
        });
        act(() => {
            fireEvent.blur(xInput);
        });

        const updated = get().state.sections.find((s) => s.id === imageA.id);
        expect(updated?.x).toBe(123);
    });

    it('clamps width to a positive value on commit', () => {
        const { container, get } = mount([imageA], [imageA.id]);
        const widthInput = container.querySelector(
            'input[aria-label="Width"]',
        ) as HTMLInputElement | null;
        expect(widthInput).not.toBeNull();
        if (!widthInput) return;

        act(() => {
            fireEvent.change(widthInput, { target: { value: '0' } });
        });
        act(() => {
            fireEvent.blur(widthInput);
        });

        const updated = get().state.sections.find((s) => s.id === imageA.id);
        expect(updated?.width).toBeGreaterThanOrEqual(1);
    });

    it('hides type-specific sub-sections in heterogeneous multi-select', () => {
        // image + text — Text panel only renders when every selection is text.
        const { container } = mount([imageA, textA], [imageA.id, textA.id]);
        expect(container.querySelector('input[aria-label="Font size"]')).toBeNull();
        // Layout still rendered because every section has x/y/w/h.
        expect(container.querySelector('input[aria-label="Position X"]')).not.toBeNull();
    });

    it('hides the Layer section when multi-select is active', () => {
        const { container } = mount([imageA, imageB], [imageA.id, imageB.id]);
        expect(container.querySelector('button[aria-label="Bring to front"]')).toBeNull();
    });

    it('renders consumer-provided children instead of the default sub-sections', () => {
        let latest: EditorContextValue;
        function Probe() {
            const editor = useEditor();
            latest = editor;
            return null;
        }
        const { container } = render(
            <Editor.Root defaultDocument={seedWith([imageA])}>
                <Probe />
                <Editor.PropertiesPanel>
                    <div data-custom="true">custom body</div>
                </Editor.PropertiesPanel>
            </Editor.Root>,
        );
        act(() => latest!.ui.setSelectedSectionId(imageA.id));
        expect(container.querySelector('[data-custom="true"]')).not.toBeNull();
        // No default Layout fields rendered when custom children are present.
        expect(container.querySelector('input[aria-label="Position X"]')).toBeNull();
    });
});
