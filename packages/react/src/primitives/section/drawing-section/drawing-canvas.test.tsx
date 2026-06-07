/**
 * @vitest-environment happy-dom
 */
import type { Document, DrawingSection } from '@docmosaic/core';
import { createDocument, createSection } from '@docmosaic/core';
import { act, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import {
    EditorSectionProvider,
    useEditor,
    type EditorContextValue,
} from '../../../context/editor';
import { Editor } from '../../../index';
import { DrawingCanvas } from './drawing-canvas';

function setup() {
    const seedSection = createSection({ type: 'drawing', x: 0, y: 0, page: 1 }) as DrawingSection;
    // Force a known PDF-point origin so we can assert against simple offsets
    // instead of chasing the createSection px→pt conversion (96 → 72 DPI).
    const seeded: DrawingSection = {
        ...seedSection,
        id: 'draw-1',
        x: 30,
        y: 30,
        width: 200,
        height: 200,
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
            ctx.ui.setSelectedSectionId('draw-1');
            ctx.ui.setDrawingMode(true);
            ctx.ui.setDrawingColor('#ff0000');
            ctx.ui.setDrawingWeight(4);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
    }

    function Mount() {
        const ctx = useEditor();
        const section = ctx.state.sections.find((s) => s.id === 'draw-1');
        if (!section || section.type !== 'drawing') return null;
        return (
            <EditorSectionProvider
                value={{
                    section,
                    rawSection: section,
                    isSelected: ctx.ui.selectedSectionId === section.id,
                    finalScale: 1,
                }}
            >
                <DrawingCanvas section={section} finalScale={1} />
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

describe('DrawingCanvas', () => {
    it('renders existing strokes as polylines', () => {
        const seedSection = createSection({ type: 'drawing', x: 0, y: 0, page: 1 }) as DrawingSection;
        const withStroke: DrawingSection = {
            ...seedSection,
            id: 'draw-with-stroke',
            width: 200,
            height: 200,
            strokes: [
                {
                    color: '#000000',
                    weight: 2,
                    points: [
                        { x: 10, y: 10 },
                        { x: 20, y: 20 },
                    ],
                },
            ],
        };
        const seed: Document = {
            ...createDocument(),
            sections: [withStroke],
        };

        function Mount() {
            const ctx = useEditor();
            const s = ctx.state.sections.find((x) => x.id === 'draw-with-stroke');
            if (!s || s.type !== 'drawing') return null;
            return (
                <EditorSectionProvider
                    value={{ section: s, rawSection: s, isSelected: false, finalScale: 1 }}
                >
                    <DrawingCanvas section={s} finalScale={1} />
                </EditorSectionProvider>
            );
        }
        const { container } = render(
            <Editor.Root defaultDocument={seed}>
                <Mount />
            </Editor.Root>,
        );
        const polylines = container.querySelectorAll('polyline');
        expect(polylines.length).toBeGreaterThanOrEqual(1);
    });

    it('accumulates pointer events into a stroke and dispatches ADD_STROKE on pointerup', () => {
        const { container, get } = setup();
        const svg = container.querySelector(
            'svg[data-drawing-canvas="true"]',
        ) as SVGSVGElement | null;
        expect(svg).not.toBeNull();
        if (!svg) return;

        // Pin a known bounding rect so client-coord conversion is deterministic.
        svg.getBoundingClientRect = () =>
            ({
                left: 0,
                top: 0,
                right: 200,
                bottom: 200,
                width: 200,
                height: 200,
                x: 0,
                y: 0,
                toJSON() {
                    return {};
                },
            }) as DOMRect;

        act(() => {
            fireEvent.pointerDown(svg, { clientX: 10, clientY: 10, pointerId: 1 });
        });
        act(() => {
            fireEvent.pointerMove(svg, { clientX: 20, clientY: 20, pointerId: 1 });
        });
        act(() => {
            fireEvent.pointerMove(svg, { clientX: 30, clientY: 30, pointerId: 1 });
        });
        act(() => {
            fireEvent.pointerUp(svg, { clientX: 30, clientY: 30, pointerId: 1 });
        });

        const target = get().state.sections.find((s) => s.id === 'draw-1');
        expect(target).toBeDefined();
        if (!target || target.type !== 'drawing') throw new Error('narrowing');
        expect(target.strokes.length).toBe(1);
        const stroke = target.strokes[0];
        expect(stroke.color).toBe('#ff0000');
        expect(stroke.weight).toBe(4);
        // Points are stored in section-LOCAL PDF-point coords. The bounding
        // rect is pinned to (0, 0)–(200, 200) and `finalScale` is `1`, so
        // client coords map 1:1 onto local coords — independent of where
        // the section sits on the page. The PDF and PNG renderers add
        // (section.x, section.y) at draw time so the strokes ride along
        // when the section is dragged.
        expect(stroke.points.length).toBe(3);
        expect(stroke.points[0]).toEqual({ x: 10, y: 10 });
        expect(stroke.points[2]).toEqual({ x: 30, y: 30 });
    });

    it('does not capture pointer events when drawing mode is off', () => {
        const seed: Document = {
            ...createDocument(),
            sections: [
                {
                    ...(createSection({
                        type: 'drawing',
                        x: 0,
                        y: 0,
                        page: 1,
                    }) as DrawingSection),
                    id: 'draw-off',
                    width: 200,
                    height: 200,
                },
            ],
        };

        let editor!: EditorContextValue;
        function Probe() {
            editor = useEditor();
            return null;
        }
        function Mount() {
            const ctx = useEditor();
            const s = ctx.state.sections.find((x) => x.id === 'draw-off');
            if (!s || s.type !== 'drawing') return null;
            return (
                <EditorSectionProvider
                    value={{ section: s, rawSection: s, isSelected: false, finalScale: 1 }}
                >
                    <DrawingCanvas section={s} finalScale={1} />
                </EditorSectionProvider>
            );
        }
        const { container } = render(
            <Editor.Root defaultDocument={seed}>
                <Probe />
                <Mount />
            </Editor.Root>,
        );
        const svg = container.querySelector(
            'svg[data-drawing-canvas="true"]',
        ) as SVGSVGElement | null;
        expect(svg).not.toBeNull();
        if (!svg) return;
        svg.getBoundingClientRect = () =>
            ({
                left: 0,
                top: 0,
                right: 200,
                bottom: 200,
                width: 200,
                height: 200,
                x: 0,
                y: 0,
                toJSON() {
                    return {};
                },
            }) as DOMRect;
        act(() => {
            fireEvent.pointerDown(svg, { clientX: 10, clientY: 10, pointerId: 1 });
            fireEvent.pointerMove(svg, { clientX: 20, clientY: 20, pointerId: 1 });
            fireEvent.pointerUp(svg, { clientX: 20, clientY: 20, pointerId: 1 });
        });
        const target = editor.state.sections.find((s) => s.id === 'draw-off');
        if (!target || target.type !== 'drawing') throw new Error('narrowing');
        expect(target.strokes.length).toBe(0);
    });
});
