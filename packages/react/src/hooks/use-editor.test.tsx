/**
 * @vitest-environment happy-dom
 */
import { act, render } from '@testing-library/react';
import type { Document, Section } from '@docmosaic/core';
import { createDocument } from '@docmosaic/core';
import { describe, expect, it, vi } from 'vitest';
import { useEditor } from '../context/editor';
import { Editor } from '../index';

type EditorValue = ReturnType<typeof useEditor>;

function Probe({ onValue }: { onValue: (value: EditorValue) => void }) {
    const value = useEditor();
    onValue(value);
    return null;
}

function setupEditor(props: Parameters<typeof Editor.Root>[0]) {
    let latest: EditorValue;
    const onValue = (value: EditorValue) => {
        latest = value;
    };
    const utils = render(
        <Editor.Root {...props}>
            <Probe onValue={onValue} />
        </Editor.Root>,
    );
    return { get: () => latest, ...utils };
}

describe('useEditor — uncontrolled Editor.Root', () => {
    it('exposes state, undo/redo flags, and a working action surface', () => {
        const { get } = setupEditor({ children: null });

        const initial = get();
        expect(initial.state).toBeDefined();
        expect(initial.state.sections).toHaveLength(0);
        expect(initial.canUndo).toBe(false);
        expect(initial.canRedo).toBe(false);

        // Stable action surface across renders.
        const actionsRef = initial.actions;

        act(() => {
            initial.actions.addSection();
        });

        const afterAdd = get();
        expect(afterAdd.state.sections).toHaveLength(1);
        expect(afterAdd.canUndo).toBe(true);
        expect(afterAdd.actions).toBe(actionsRef);

        // Undo rewinds the timeline.
        act(() => afterAdd.actions.undo());
        const afterUndo = get();
        expect(afterUndo.state.sections).toHaveLength(0);
        expect(afterUndo.canUndo).toBe(false);
        expect(afterUndo.canRedo).toBe(true);
    });

    it('seeds the document from `defaultDocument`', () => {
        const seed: Document = {
            ...createDocument(),
            name: 'Seeded',
        };
        const { get } = setupEditor({ children: null, defaultDocument: seed });

        expect(get().state.name).toBe('Seeded');
    });
});

describe('useEditor — controlled Editor.Root', () => {
    it('dispatches addSection through onDocumentChange with the new document', () => {
        const initialDoc = createDocument();
        const onDocumentChange = vi.fn<(next: Document) => void>();

        const { get } = setupEditor({
            children: null,
            document: initialDoc,
            onDocumentChange,
        });

        const initial = get();
        expect(initial.state).toBe(initialDoc);
        expect(initial.canUndo).toBe(false);
        expect(initial.canRedo).toBe(false);

        act(() => {
            initial.actions.addSection();
        });

        expect(onDocumentChange).toHaveBeenCalledTimes(1);
        const nextDoc = onDocumentChange.mock.calls[0][0];
        expect(nextDoc.sections).toHaveLength(initialDoc.sections.length + 1);
        const newSection = nextDoc.sections[nextDoc.sections.length - 1] as Section;
        expect(newSection.page).toBe(initialDoc.currentPage);
    });

    it('routes updateName through onDocumentChange', () => {
        const initialDoc = createDocument();
        const onDocumentChange = vi.fn<(next: Document) => void>();

        const { get } = setupEditor({
            children: null,
            document: initialDoc,
            onDocumentChange,
        });

        act(() => {
            get().actions.updateName('Renamed');
        });

        expect(onDocumentChange).toHaveBeenCalledTimes(1);
        expect(onDocumentChange.mock.calls[0][0].name).toBe('Renamed');
    });
});
