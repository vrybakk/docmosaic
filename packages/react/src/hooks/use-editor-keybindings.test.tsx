/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render } from '@testing-library/react';
import { createDocument, createSection, type Document, type Section } from '@docmosaic/core';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useEditor, type EditorContextValue } from '../context/editor';
import { Editor } from '../index';

/**
 * Mount `Editor.Root` with a seeded document that already has one section, then
 * pre-select it via a probe component. Tests can either inspect the internal
 * editor state through `get()` (uncontrolled) or assert against
 * `onDocumentChange` (controlled).
 */
function setupWithSelectedSection(
    rootProps: Partial<Parameters<typeof Editor.Root>[0]> = {},
) {
    const section: Section = { ...createSection({ x: 0, y: 0, page: 1 }), x: 100, y: 100 };
    const seed: Document = {
        ...createDocument(),
        sections: [section],
    };

    let latest: EditorContextValue;
    function Probe() {
        const editor = useEditor();
        latest = editor;
        // Pre-select the seeded section once on mount.
        useEffect(() => {
            editor.ui.setSelectedSectionId(section.id);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
    }

    const utils = render(
        <Editor.Root defaultDocument={seed} {...(rootProps as object)}>
            <Probe />
        </Editor.Root>,
    );

    return {
        ...utils,
        get: () => latest,
        section,
    };
}

function dispatchKey(init: KeyboardEventInit) {
    act(() => {
        fireEvent.keyDown(window, init);
    });
}

describe('useEditorKeybindings — default keymap', () => {
    it('Delete removes the selected section', () => {
        const { get } = setupWithSelectedSection();
        expect(get().state.sections).toHaveLength(1);

        dispatchKey({ key: 'Delete' });

        expect(get().state.sections).toHaveLength(0);
        expect(get().ui.selectedSectionId).toBeNull();
    });

    it('Backspace removes the selected section', () => {
        const { get } = setupWithSelectedSection();

        dispatchKey({ key: 'Backspace' });

        expect(get().state.sections).toHaveLength(0);
    });

    it('Escape clears the selection without mutating the document', () => {
        const { get, section } = setupWithSelectedSection();
        expect(get().ui.selectedSectionId).toBe(section.id);

        dispatchKey({ key: 'Escape' });

        expect(get().ui.selectedSectionId).toBeNull();
        expect(get().state.sections).toHaveLength(1);
    });

    it('ArrowRight nudges the selected section by 1pt', () => {
        const { get, section } = setupWithSelectedSection();
        const startX = section.x;

        dispatchKey({ key: 'ArrowRight' });

        const moved = get().state.sections[0];
        expect(moved.x).toBe(startX + 1);
        expect(moved.y).toBe(section.y);
    });

    it('ArrowLeft / ArrowUp / ArrowDown each nudge by 1pt in the right axis', () => {
        const { get, section } = setupWithSelectedSection();
        const { x: x0, y: y0 } = section;

        dispatchKey({ key: 'ArrowLeft' });
        expect(get().state.sections[0]).toMatchObject({ x: x0 - 1, y: y0 });

        dispatchKey({ key: 'ArrowUp' });
        expect(get().state.sections[0]).toMatchObject({ x: x0 - 1, y: y0 - 1 });

        dispatchKey({ key: 'ArrowDown' });
        expect(get().state.sections[0]).toMatchObject({ x: x0 - 1, y: y0 });
    });

    it('Shift+ArrowRight nudges by 10pt (not 1pt)', () => {
        const { get, section } = setupWithSelectedSection();
        const startX = section.x;

        dispatchKey({ key: 'ArrowRight', shiftKey: true });

        expect(get().state.sections[0].x).toBe(startX + 10);
    });

    it('does not dispatch when focus is inside an <input>', () => {
        const { get } = setupWithSelectedSection();
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        fireEvent.keyDown(input, { key: 'Delete' });

        expect(get().state.sections).toHaveLength(1);

        document.body.removeChild(input);
    });

    it('does not dispatch when focus is inside contenteditable', () => {
        const { get } = setupWithSelectedSection();
        const div = document.createElement('div');
        div.setAttribute('contenteditable', 'true');
        document.body.appendChild(div);
        div.focus();

        fireEvent.keyDown(div, { key: 'Backspace' });

        expect(get().state.sections).toHaveLength(1);

        document.body.removeChild(div);
    });
});

describe('useEditorKeybindings — overrides and disable', () => {
    it('accepts a custom binding that overrides the default', () => {
        const { get } = setupWithSelectedSection({
            keybindings: { deleteSection: 'x' },
        });

        // Default Delete is replaced — pressing Delete is a no-op.
        dispatchKey({ key: 'Delete' });
        expect(get().state.sections).toHaveLength(1);

        // The new binding fires the action.
        dispatchKey({ key: 'x' });
        expect(get().state.sections).toHaveLength(0);
    });

    it('keybindings={false} disables all shortcuts', () => {
        const { get } = setupWithSelectedSection({ keybindings: false });

        dispatchKey({ key: 'Delete' });
        dispatchKey({ key: 'Escape' });
        dispatchKey({ key: 'ArrowRight' });

        // Nothing was dispatched — the section is still here, still selected,
        // still at its original coordinates.
        expect(get().state.sections).toHaveLength(1);
        expect(get().ui.selectedSectionId).not.toBeNull();
        expect(get().state.sections[0].x).toBe(100);
    });
});

describe('useEditorKeybindings — undo / redo', () => {
    it('mod+z triggers undo after a mutation', () => {
        // Force the matcher into "Mac" mode by stubbing navigator.platform
        // and dispatch with metaKey.
        const originalPlatform = navigator.platform;
        Object.defineProperty(navigator, 'platform', {
            value: 'MacIntel',
            configurable: true,
        });

        try {
            const { get, section } = setupWithSelectedSection();
            expect(get().state.sections).toHaveLength(1);

            // Mutate via the keybinding so we have something to undo.
            dispatchKey({ key: 'ArrowRight' });
            expect(get().state.sections[0].x).toBe(section.x + 1);
            expect(get().canUndo).toBe(true);

            dispatchKey({ key: 'z', metaKey: true });
            expect(get().state.sections[0].x).toBe(section.x);
        } finally {
            Object.defineProperty(navigator, 'platform', {
                value: originalPlatform,
                configurable: true,
            });
        }
    });
});

describe('useEditorKeybindings — controlled mode', () => {
    it('forwards mutations through onDocumentChange', () => {
        const section: Section = { ...createSection({ x: 0, y: 0, page: 1 }), x: 50, y: 50 };
        const seed: Document = { ...createDocument(), sections: [section] };
        const onDocumentChange = vi.fn<(next: Document) => void>();

        function Probe() {
            const editor = useEditor();
            useEffect(() => {
                editor.ui.setSelectedSectionId(section.id);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);
            return null;
        }

        render(
            <Editor.Root document={seed} onDocumentChange={onDocumentChange}>
                <Probe />
            </Editor.Root>,
        );

        dispatchKey({ key: 'ArrowRight' });

        expect(onDocumentChange).toHaveBeenCalled();
        const next = onDocumentChange.mock.calls.at(-1)![0];
        expect(next.sections[0].x).toBe(51);
    });
});
