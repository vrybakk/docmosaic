/**
 * @vitest-environment happy-dom
 *
 * Phase 28 — `Editor.ContextMenu` primitive coverage.
 *
 * Tests cover:
 * - Right-click on a section opens the section menu with the expected items.
 * - Right-click on empty canvas opens the canvas menu (paste/select-all).
 * - Selecting "Duplicate" calls the duplicate-section action.
 * - Read-only mode disables mutating items but keeps the menu reachable.
 */
import { createDocument, createSection, type Document, type ImageSection } from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useEditor, type EditorContextValue } from '../context/editor';
import { Editor } from '../index';
import { __resetContextMenuClipboard } from './context-menu';

function seedWith(sections: ImageSection[]): Document {
    return { ...createDocument(), sections };
}

interface MountResult {
    container: HTMLElement;
    get: () => EditorContextValue;
}

function mount(sections: ImageSection[], readOnly = false): MountResult {
    let latest: EditorContextValue | undefined;
    function Probe() {
        latest = useEditor();
        return null;
    }
    const { container } = render(
        <Editor.Root defaultDocument={seedWith(sections)} readOnly={readOnly}>
            <Probe />
            <Editor.ContextMenu>
                <div data-canvas-stub="true" style={{ width: 400, height: 400 }}>
                    {sections.map((s) => (
                        <div
                            key={s.id}
                            data-section="true"
                            data-section-id={s.id}
                            data-section-stub="true"
                            style={{ width: 100, height: 100 }}
                        >
                            section {s.id}
                        </div>
                    ))}
                </div>
            </Editor.ContextMenu>
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

function buildSections() {
    const a = createSection({ x: 10, y: 10, page: 1 }) as ImageSection;
    const b = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    return {
        a: { ...a, id: 'sec-a', zIndex: 0 },
        b: { ...b, id: 'sec-b', zIndex: 1 },
    };
}

function openContextMenuOn(target: Element) {
    act(() => {
        fireEvent.contextMenu(target, { clientX: 10, clientY: 10 });
    });
}

function getMenuItems(container: HTMLElement) {
    return Array.from(
        container.ownerDocument.body.querySelectorAll('[data-context-menu-item]'),
    ) as HTMLElement[];
}

afterEach(() => {
    __resetContextMenuClipboard();
});

describe('Editor.ContextMenu', () => {
    it('renders the section menu when right-clicking a section', () => {
        const { a, b } = buildSections();
        const { container } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const items = getMenuItems(container);
        const keys = items.map((el) => el.getAttribute('data-context-menu-item'));
        expect(keys).toEqual(
            expect.arrayContaining([
                'copy',
                'duplicate',
                'delete',
                'bring-to-front',
                'send-to-back',
                'move-forward',
                'move-backward',
                'toggle-hidden',
                'toggle-locked',
            ]),
        );
    });

    it('renders the canvas menu when right-clicking outside any section', () => {
        const { a, b } = buildSections();
        const { container } = mount([a, b]);
        const canvasEl = container.querySelector('[data-canvas-stub="true"]') as HTMLElement;
        openContextMenuOn(canvasEl);
        const items = getMenuItems(container);
        const keys = items.map((el) => el.getAttribute('data-context-menu-item'));
        expect(keys).toEqual(expect.arrayContaining(['paste', 'select-all', 'deselect']));
        // No section-only items should leak through.
        expect(keys).not.toEqual(expect.arrayContaining(['duplicate', 'delete']));
    });

    it('clicking Duplicate dispatches duplicateSection on the target section', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const duplicate = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'duplicate',
        ) as HTMLElement;
        expect(duplicate).toBeTruthy();
        const before = get().state.sections.length;
        act(() => {
            fireEvent.click(duplicate);
        });
        expect(get().state.sections.length).toBe(before + 1);
    });

    it('right-clicking an unselected section selects it', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-b"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        expect(get().ui.selectedSectionId).toBe('sec-b');
    });

    it('clicking Delete dispatches deleteSection for that section', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const del = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'delete',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(del);
        });
        expect(get().state.sections.find((s) => s.id === 'sec-a')).toBeUndefined();
    });

    it('Select all replaces the selection with every section on the current page', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const canvasEl = container.querySelector('[data-canvas-stub="true"]') as HTMLElement;
        openContextMenuOn(canvasEl);
        const selectAll = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'select-all',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(selectAll);
        });
        expect(get().ui.selectedSectionIds.size).toBe(2);
        expect(get().ui.selectedSectionIds.has('sec-a')).toBe(true);
        expect(get().ui.selectedSectionIds.has('sec-b')).toBe(true);
    });

    it('copy + paste duplicates the copied section', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        // Copy sec-a.
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const copyItem = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'copy',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(copyItem);
        });
        const before = get().state.sections.length;
        // Re-open menu on the canvas and click paste.
        const canvasEl = container.querySelector('[data-canvas-stub="true"]') as HTMLElement;
        openContextMenuOn(canvasEl);
        const paste = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'paste',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(paste);
        });
        expect(get().state.sections.length).toBe(before + 1);
    });

    it('readOnly disables mutating items', () => {
        const { a, b } = buildSections();
        const { container } = mount([a, b], true);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const items = getMenuItems(container);
        const find = (key: string) =>
            items.find((el) => el.getAttribute('data-context-menu-item') === key)!;
        // Copy stays enabled (read-only); delete/duplicate get disabled.
        expect(find('duplicate').getAttribute('data-disabled')).toBe('');
        expect(find('delete').getAttribute('data-disabled')).toBe('');
        expect(find('copy').getAttribute('data-disabled')).toBeNull();
    });
});

describe('Editor.ContextMenu — toggle items', () => {
    it('toggle-hidden flips the hidden flag', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const toggle = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'toggle-hidden',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(toggle);
        });
        expect(get().state.sections.find((s) => s.id === 'sec-a')?.hidden).toBe(true);
    });

    it('toggle-locked flips the locked flag', () => {
        const { a, b } = buildSections();
        const { container, get } = mount([a, b]);
        const sectionEl = container.querySelector('[data-section-id="sec-a"]') as HTMLElement;
        openContextMenuOn(sectionEl);
        const toggle = getMenuItems(container).find(
            (el) => el.getAttribute('data-context-menu-item') === 'toggle-locked',
        ) as HTMLElement;
        act(() => {
            fireEvent.click(toggle);
        });
        expect(get().state.sections.find((s) => s.id === 'sec-a')?.locked).toBe(true);
    });
});
