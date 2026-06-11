/**
 * @vitest-environment happy-dom
 */
import type { Document, TextSection } from '@docmosaic/core';
import { createDocument, createSection } from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { EditorSectionProvider, useEditor, type EditorContextValue } from '../../../context/editor';
import { Editor } from '../../../index';
import { TextSectionView } from './index';

function setup() {
    const placeholder = createSection({ type: 'text', x: 30, y: 30, page: 1 }) as TextSection;
    const seeded: TextSection = {
        ...placeholder,
        id: 'text-1',
        text: '',
        width: 280,
        height: 80,
        fontSize: 18,
    };
    const seed: Document = {
        ...createDocument(),
        sections: [seeded],
    };

    let editor: EditorContextValue;
    function Probe() {
        const ctx = useEditor();
        editor = ctx;
        useEffect(() => {
            ctx.ui.setSelectedSectionId('text-1');
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
    }

    // Render the TextSectionView directly under an EditorSectionProvider so
    // the test doesn't need to wait for Canvas auto-fit / load timing.
    function Mount() {
        const ctx = useEditor();
        const section = ctx.state.sections.find((s) => s.id === 'text-1');
        if (!section) return null;
        return (
            <EditorSectionProvider
                value={{
                    section,
                    rawSection: section,
                    isSelected: ctx.ui.selectedSectionId === section.id,
                    finalScale: 1,
                }}
            >
                <TextSectionView />
            </EditorSectionProvider>
        );
    }

    const utils = render(
        <Editor.Root defaultDocument={seed}>
            <Probe />
            <Mount />
        </Editor.Root>,
    );

    return { ...utils, get: () => editor };
}

describe('TextSectionView', () => {
    it('renders a contentEditable that updates section.text on input', () => {
        const { container, get } = setup();
        const node = container.querySelector('[data-text-editor="true"]') as HTMLDivElement | null;
        expect(node).not.toBeNull();
        if (!node) return;

        // Enter editing mode (double-click).
        act(() => {
            fireEvent.doubleClick(node);
        });

        // Simulate the user typing — set innerText and fire input.
        act(() => {
            node.innerText = 'Hello world';
            fireEvent.input(node);
        });

        const text = get().state.sections.find((s) => s.id === 'text-1');
        expect(text).toBeDefined();
        if (!text || text.type !== 'text') throw new Error('narrowing');
        expect(text.text).toBe('Hello world');
    });
});
