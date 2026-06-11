/**
 * @vitest-environment happy-dom
 *
 * Phase 16 — selection model.
 *
 * The selection lives in editor UI state (a Set of ids) so reducer-style
 * tests don't apply. These exercise the action surface and the shift+click
 * onClick wired by `useEditorSection`.
 */
import { act, fireEvent, render } from '@testing-library/react';
import { createDocument, createSection, type Document, type ImageSection } from '@docmosaic/core';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { EditorSectionProvider, useEditor, type EditorContextValue } from '../context/editor';
import { ImageSectionView } from '../primitives/section/image-section';
import { Editor } from '../index';

function seedWith(sections: ImageSection[]): Document {
    return {
        ...createDocument(),
        sections,
    };
}

function setupEditor(sections: ImageSection[]) {
    let latest: EditorContextValue;
    function Probe() {
        const editor = useEditor();
        latest = editor;
        return null;
    }
    const utils = render(
        <Editor.Root defaultDocument={seedWith(sections)}>
            <Probe />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
        </Editor.Root>,
    );
    return { ...utils, get: () => latest };
}

const sectionA = createSection({ x: 10, y: 10, page: 1 }) as ImageSection;
const sectionB = createSection({ x: 220, y: 10, page: 1 }) as ImageSection;
const sectionC = createSection({ x: 10, y: 220, page: 1 }) as ImageSection;

describe('selection — action surface', () => {
    it('setSelectedSectionId replaces the set with a single id', () => {
        const { get } = setupEditor([sectionA, sectionB]);
        expect(get().ui.selectedSectionIds.size).toBe(0);

        act(() => get().ui.setSelectedSectionId(sectionA.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id]));
        expect(get().ui.selectedSectionId).toBe(sectionA.id);

        act(() => get().ui.setSelectedSectionId(sectionB.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionB.id]));
        expect(get().ui.selectedSectionId).toBe(sectionB.id);

        act(() => get().ui.setSelectedSectionId(null));
        expect(get().ui.selectedSectionIds.size).toBe(0);
        expect(get().ui.selectedSectionId).toBeNull();
    });

    it('addToSelection grows the set; duplicate ids are no-ops', () => {
        const { get } = setupEditor([sectionA, sectionB]);
        act(() => get().ui.setSelectedSectionId(sectionA.id));
        act(() => get().ui.addToSelection(sectionB.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id, sectionB.id]));

        const previous = get().ui.selectedSectionIds;
        act(() => get().ui.addToSelection(sectionA.id));
        // Same set reference because adding an existing id is a no-op.
        expect(get().ui.selectedSectionIds).toBe(previous);
    });

    it('removeFromSelection shrinks the set; missing ids are no-ops', () => {
        const { get } = setupEditor([sectionA, sectionB, sectionC]);
        act(() => get().ui.selectMany([sectionA.id, sectionB.id, sectionC.id]));
        act(() => get().ui.removeFromSelection(sectionB.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id, sectionC.id]));

        const previous = get().ui.selectedSectionIds;
        act(() => get().ui.removeFromSelection('does-not-exist'));
        expect(get().ui.selectedSectionIds).toBe(previous);
    });

    it('toggleSelection adds when absent and removes when present', () => {
        const { get } = setupEditor([sectionA, sectionB]);
        act(() => get().ui.toggleSelection(sectionA.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id]));
        act(() => get().ui.toggleSelection(sectionA.id));
        expect(get().ui.selectedSectionIds.size).toBe(0);
        act(() => get().ui.toggleSelection(sectionA.id));
        act(() => get().ui.toggleSelection(sectionB.id));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id, sectionB.id]));
    });

    it('selectMany replaces the set with the given ids', () => {
        const { get } = setupEditor([sectionA, sectionB, sectionC]);
        act(() => get().ui.selectMany([sectionA.id, sectionC.id]));
        expect(get().ui.selectedSectionIds).toEqual(new Set([sectionA.id, sectionC.id]));
    });

    it('clearSelection empties the set', () => {
        const { get } = setupEditor([sectionA, sectionB]);
        act(() => get().ui.selectMany([sectionA.id, sectionB.id]));
        act(() => get().ui.clearSelection());
        expect(get().ui.selectedSectionIds.size).toBe(0);
        expect(get().ui.selectedSectionId).toBeNull();
    });
});

describe('selection — shift+click toggle via useEditorSection', () => {
    function setupTwo() {
        // Bypass the Canvas — happy-dom has no layout so its auto-fit gate
        // never resolves. Mount each section directly under an
        // EditorSectionProvider so the onClick wiring runs.
        const sections = [
            { ...sectionA, imageUrl: undefined } as ImageSection,
            { ...sectionB, imageUrl: undefined } as ImageSection,
        ];

        let latest: EditorContextValue;
        function Probe() {
            const editor = useEditor();
            latest = editor;
            useEffect(() => {
                editor.ui.setSelectedSectionId(sections[0].id);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);
            return null;
        }

        function Mount() {
            const ctx = useEditor();
            return (
                <>
                    {ctx.state.sections.map((s) => (
                        <EditorSectionProvider
                            key={s.id}
                            value={{
                                section: s,
                                rawSection: s,
                                isSelected: ctx.ui.selectedSectionIds.has(s.id),
                                finalScale: 1,
                            }}
                        >
                            <ImageSectionView />
                        </EditorSectionProvider>
                    ))}
                </>
            );
        }

        const utils = render(
            <Editor.Root defaultDocument={seedWith(sections)}>
                <Probe />
                <Mount />
            </Editor.Root>,
        );

        return { ...utils, get: () => latest, sections };
    }

    it('shift+click on a different section adds it to the selection', () => {
        const { get, container } = setupTwo();

        const [, second] = container.querySelectorAll<HTMLDivElement>('[data-section="true"]');
        expect(second).toBeTruthy();
        expect(get().ui.selectedSectionIds.size).toBe(1);

        act(() => {
            fireEvent.click(second, { shiftKey: true });
        });

        expect(get().ui.selectedSectionIds.size).toBe(2);
    });

    it('plain click replaces the selection with the clicked section', () => {
        const { get, container } = setupTwo();
        const [, second] = container.querySelectorAll<HTMLDivElement>('[data-section="true"]');

        act(() => {
            fireEvent.click(second, { shiftKey: false });
        });

        expect(get().ui.selectedSectionIds.size).toBe(1);
    });

    it('shift+click on an already-selected section removes it', () => {
        const { get, container, sections } = setupTwo();
        const [first, second] = container.querySelectorAll<HTMLDivElement>('[data-section="true"]');

        act(() => {
            fireEvent.click(second, { shiftKey: true });
        });
        expect(get().ui.selectedSectionIds.size).toBe(2);

        act(() => {
            fireEvent.click(first, { shiftKey: true });
        });
        // Only B remains — the second clicked section.
        expect(get().ui.selectedSectionIds).toEqual(new Set([sections[1].id]));
    });
});
