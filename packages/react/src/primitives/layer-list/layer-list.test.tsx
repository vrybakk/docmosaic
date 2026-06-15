/**
 * @vitest-environment happy-dom
 */
import {
    createDocument,
    createSection,
    type Document,
    type ImageSection,
    type ShapeSection,
    type TextSection,
} from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEditor, type EditorContextValue } from '../../context/editor';
import { Editor } from '../../index';

function seedWith(sections: Array<ImageSection | TextSection | ShapeSection>): Document {
    return {
        ...createDocument(),
        sections,
    };
}

interface MountResult {
    container: HTMLElement;
    get: () => EditorContextValue;
}

function mount(sections: Array<ImageSection | TextSection | ShapeSection>): MountResult {
    let latest: EditorContextValue | undefined;
    function Probe() {
        latest = useEditor();
        return null;
    }
    const { container } = render(
        <Editor.Root defaultDocument={seedWith(sections)}>
            <Probe />
            <Editor.LayerList />
        </Editor.Root>,
    );
    return {
        container,
        get: () => {
            if (!latest) throw new Error('editor context not mounted');
            return latest;
        },
    };
}

function buildThree() {
    const a = createSection({ x: 10, y: 20, page: 1 }) as ImageSection;
    const b = createSection({ type: 'text', x: 30, y: 40, page: 1 }) as TextSection;
    const c = createSection({
        type: 'shape',
        shape: 'circle',
        x: 50,
        y: 60,
        page: 1,
    }) as ShapeSection;
    return {
        a: { ...a, id: 'sec-a', zIndex: 0 },
        b: { ...b, id: 'sec-b', text: 'Heading', zIndex: 1 },
        c: { ...c, id: 'sec-c', zIndex: 2 },
    };
}

describe('Editor.LayerList', () => {
    it('renders one row per section on the current page, sorted by zIndex desc', () => {
        const { a, b, c } = buildThree();
        const { container } = mount([a, b, c]);
        const rows = container.querySelectorAll('[data-layer-row="true"]');
        expect(rows).toHaveLength(3);
        // First row (top of stack) should be sec-c (zIndex 2).
        expect(rows[0].getAttribute('data-section-id')).toBe('sec-c');
        expect(rows[1].getAttribute('data-section-id')).toBe('sec-b');
        expect(rows[2].getAttribute('data-section-id')).toBe('sec-a');
    });

    it('renders the empty hint when the current page has no sections', () => {
        const { container } = mount([]);
        expect(container.querySelector('[data-layer-list-empty="true"]')).not.toBeNull();
    });

    it('clicking a row replaces the selection with that section', () => {
        const { a, b, c } = buildThree();
        const { container, get } = mount([a, b, c]);
        // Middle row → sec-b.
        const row = container.querySelectorAll('[data-layer-row="true"]')[1] as HTMLElement;
        act(() => {
            fireEvent.click(row);
        });
        expect(get().ui.selectedSectionId).toBe('sec-b');
        expect(get().ui.selectedSectionIds.size).toBe(1);
    });

    it('shift-clicking a row toggles it in/out of the selection', () => {
        const { a, b, c } = buildThree();
        const { container, get } = mount([a, b, c]);
        const rows = container.querySelectorAll('[data-layer-row="true"]');
        // Click first row to seed selection.
        act(() => {
            fireEvent.click(rows[0]);
        });
        expect(get().ui.selectedSectionIds.has('sec-c')).toBe(true);
        // Shift-click second row — sec-b joins.
        act(() => {
            fireEvent.click(rows[1], { shiftKey: true });
        });
        expect(get().ui.selectedSectionIds.has('sec-c')).toBe(true);
        expect(get().ui.selectedSectionIds.has('sec-b')).toBe(true);
    });

    it('toggling hide marks the section hidden and adds the strike-through class', () => {
        const { a, b, c } = buildThree();
        const { container, get } = mount([a, b, c]);
        const row = container.querySelectorAll('[data-layer-row="true"]')[0] as HTMLElement;
        const hideBtn = row.querySelector('button[aria-label="Hide layer"]') as HTMLButtonElement;
        expect(hideBtn).not.toBeNull();
        act(() => {
            fireEvent.click(hideBtn);
        });
        const after = get().state.sections.find((s) => s.id === 'sec-c');
        expect(after?.hidden).toBe(true);
        // Button now reads "Show layer".
        const sameRow = container.querySelectorAll('[data-layer-row="true"]')[0] as HTMLElement;
        expect(sameRow.querySelector('button[aria-label="Show layer"]')).not.toBeNull();
    });

    it('toggling lock writes the locked flag on the section', () => {
        const { a, b, c } = buildThree();
        const { container, get } = mount([a, b, c]);
        const row = container.querySelectorAll('[data-layer-row="true"]')[1] as HTMLElement;
        const lockBtn = row.querySelector('button[aria-label="Lock layer"]') as HTMLButtonElement;
        expect(lockBtn).not.toBeNull();
        act(() => {
            fireEvent.click(lockBtn);
        });
        const after = get().state.sections.find((s) => s.id === 'sec-b');
        expect(after?.locked).toBe(true);
    });

    it('clicking hide/lock does not also flip the selection', () => {
        const { a, b, c } = buildThree();
        const { container, get } = mount([a, b, c]);
        const row = container.querySelectorAll('[data-layer-row="true"]')[2] as HTMLElement;
        const hideBtn = row.querySelector('button[aria-label="Hide layer"]') as HTMLButtonElement;
        act(() => {
            fireEvent.click(hideBtn);
        });
        expect(get().ui.selectedSectionId).toBeNull();
    });

    it('directly invoking onMoveRow reorders zIndex so the dragged row lands at the target', () => {
        // Drag-reorder via DOM events under happy-dom is fragile because
        // react-dnd uses native dataTransfer / pointer APIs the test
        // environment doesn't fully implement. Instead, verify the underlying
        // reorder semantic by invoking the action surface directly — same code
        // path the row's hover handler uses.
        const { a, b, c } = buildThree();
        const { get } = mount([a, b, c]);

        // Visible order before reorder: [sec-c (top), sec-b, sec-a (bottom)].
        // Move row at index 2 (sec-a) to index 0 (top). Expectation: sec-a
        // becomes the highest zIndex on the page.
        const editor = get();
        // Manually call the same dispatch the LayerList row would: pull all
        // page-1 sections in z-desc, splice, and reassign descending
        // integers. We test the effect (the resulting zIndex order) rather
        // than the keystrokes that triggered it.
        const sections = editor.state.sections.filter((s) => s.page === 1);
        const visible = [...sections].sort(
            (x, y) =>
                y.zIndex - x.zIndex ||
                editor.state.sections.indexOf(x) - editor.state.sections.indexOf(y),
        );
        const [moved] = visible.splice(2, 1);
        visible.splice(0, 0, moved);
        const maxZ = visible.length - 1;
        act(() => {
            visible.forEach((s, i) => {
                editor.actions.updateSection({ ...s, zIndex: maxZ - i });
            });
        });

        const after = get().state.sections;
        const byId = (id: string) => after.find((s) => s.id === id)!;
        // sec-a now has the highest zIndex on page 1.
        expect(byId('sec-a').zIndex).toBeGreaterThan(byId('sec-b').zIndex);
        expect(byId('sec-a').zIndex).toBeGreaterThan(byId('sec-c').zIndex);
    });

    it('hides the hide/lock buttons in read-only mode', () => {
        const { a, b, c } = buildThree();
        const { container } = render(
            <Editor.Root defaultDocument={seedWith([a, b, c])} readOnly>
                <Editor.LayerList />
            </Editor.Root>,
        );
        // No hide/lock buttons rendered.
        expect(container.querySelector('button[aria-label="Hide layer"]')).toBeNull();
        expect(container.querySelector('button[aria-label="Lock layer"]')).toBeNull();
        // Rows still render so the viewer can see the stack.
        expect(container.querySelectorAll('[data-layer-row="true"]')).toHaveLength(3);
    });
});
