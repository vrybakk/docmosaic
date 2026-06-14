/**
 * @vitest-environment happy-dom
 */
import type { Document, FrameSection, ImageSection } from '@docmosaic/core';
import { createDocument, createSection } from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { EditorSectionProvider, useEditor, type EditorContextValue } from '../../../context/editor';
import { Editor } from '../../../index';
import { FrameSectionView } from './index';

function setup() {
    const frame = createSection({ type: 'frame', x: 40, y: 40, page: 1 }) as FrameSection;
    const seededFrame: FrameSection = {
        ...frame,
        id: 'frame-1',
        width: 300,
        height: 200,
        fill: '#ffffff',
        stroke: '#000000',
    };
    const child = createSection({ x: 0, y: 0, page: 1 }) as ImageSection;
    const seededChild: ImageSection = {
        ...child,
        id: 'child-1',
        parentFrameId: 'frame-1',
        x: 60,
        y: 70,
        width: 120,
        height: 90,
    };
    const seed: Document = { ...createDocument(), sections: [seededFrame, seededChild] };

    let editor: EditorContextValue;
    function Probe() {
        const ctx = useEditor();
        editor = ctx;
        useEffect(() => {
            ctx.ui.setSelectedSectionId('frame-1');
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
    }

    // Render FrameSectionView directly under an EditorSectionProvider so the
    // test doesn't depend on Canvas auto-fit / load timing.
    function Mount() {
        const ctx = useEditor();
        const section = ctx.state.sections.find((s) => s.id === 'frame-1');
        if (!section) return null;
        return (
            <EditorSectionProvider
                value={{
                    section,
                    rawSection: section,
                    isSelected: ctx.ui.selectedSectionId === section.id,
                    finalScale: 1,
                    readOnly: false,
                }}
            >
                <FrameSectionView />
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

describe('FrameSectionView', () => {
    it('renders the frame box and its fill/border toolbar', () => {
        const { container } = setup();
        expect(container.querySelector('[data-section-type="frame"]')).not.toBeNull();
        expect(container.textContent).toContain('Fill');
        expect(container.textContent).toContain('Border');
    });

    it('deleting the frame cascades to its children', () => {
        const { container, get } = setup();
        const del = container.querySelector(
            'button[aria-label="delete"]',
        ) as HTMLButtonElement | null;
        expect(del).not.toBeNull();
        if (!del) return;

        act(() => {
            fireEvent.click(del);
        });

        // The frame and its one child are both gone — the reducer's
        // DELETE_SECTION cascade removed every `parentFrameId === 'frame-1'`.
        expect(get().state.sections).toHaveLength(0);
    });
});
