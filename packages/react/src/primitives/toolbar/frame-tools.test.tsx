/**
 * @vitest-environment happy-dom
 */
import { createDocument } from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEditor, type EditorContextValue } from '../../context/editor';
import { Editor } from '../../index';

function setup() {
    let editor!: EditorContextValue;
    function Probe() {
        editor = useEditor();
        return null;
    }
    const utils = render(
        <Editor.Root defaultDocument={createDocument()}>
            <Probe />
            <Editor.SelectToolButton iconOnly />
            <Editor.ShapeToolButton iconOnly />
            <Editor.FrameToolButton iconOnly />
            <Editor.ImageFrameToolButton iconOnly />
        </Editor.Root>,
    );

    const clickLabel = (match: (label: string) => boolean) => {
        const btn = Array.from(utils.container.querySelectorAll('button[aria-label]')).find((b) =>
            match(b.getAttribute('aria-label') ?? ''),
        ) as HTMLButtonElement | undefined;
        if (!btn) throw new Error('button not found');
        act(() => {
            fireEvent.click(btn);
        });
    };

    return {
        ...utils,
        get: () => editor,
        clickFrame: () => clickLabel((l) => l === 'Frame' || l === 'Cancel Frame'),
        clickImageFrame: () =>
            clickLabel((l) => l.startsWith('Image frame') || l === 'Cancel image frame'),
        clickSelect: () => clickLabel((l) => l === 'Select'),
        clickShape: () => clickLabel((l) => /^Draw /.test(l) && !l.includes('frame')),
    };
}

describe('frame draw tools', () => {
    it('arming the frame tool sets ui.frameTool', () => {
        const t = setup();
        t.clickFrame();
        expect(t.get().ui.frameTool).toBe(true);
    });

    it('arming the image-frame tool disarms the frame tool (mutually exclusive)', () => {
        const t = setup();
        t.clickFrame();
        expect(t.get().ui.frameTool).toBe(true);

        t.clickImageFrame();
        expect(t.get().ui.imageFrameTool).not.toBeNull();
        expect(t.get().ui.frameTool).toBe(false);
    });

    it('arming the frame tool disarms the shape tool', () => {
        const t = setup();
        t.clickShape();
        expect(t.get().ui.shapeTool).not.toBeNull();

        t.clickFrame();
        expect(t.get().ui.frameTool).toBe(true);
        expect(t.get().ui.shapeTool).toBeNull();
    });

    it('the select tool disarms every draw tool', () => {
        const t = setup();
        t.clickImageFrame();
        expect(t.get().ui.imageFrameTool).not.toBeNull();

        t.clickSelect();
        expect(t.get().ui.frameTool).toBe(false);
        expect(t.get().ui.imageFrameTool).toBeNull();
        expect(t.get().ui.shapeTool).toBeNull();
        expect(t.get().ui.drawingMode).toBe(false);
    });
});
