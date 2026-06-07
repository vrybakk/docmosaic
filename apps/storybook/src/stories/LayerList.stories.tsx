import type { Meta, StoryObj } from '@storybook/react';
import { createDocument, createSection } from '@docmosaic/core';
import type {
    Document,
    DrawingSection,
    ImageSection,
    ShapeSection,
    TextSection,
} from '@docmosaic/core';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.LayerList` is a Figma/Photoshop-style outliner that lists every
 * section on the current page in render order (top of stack first). Click a
 * row to select, shift/meta-click to extend the selection, drag the grip
 * handle to reorder, and use the per-row buttons to hide or lock the
 * section.
 *
 * Stories below seed sample documents — the panel reads sections + the
 * current page from `useEditor()` so no other wiring is needed.
 */
const meta: Meta<typeof Editor.LayerList> = {
    title: 'Editor/Layer List',
    component: Editor.LayerList,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.LayerList>;

const PLACEHOLDER_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Document seed with three different section types so each lucide icon
 *  surfaces in the list. */
function mixedDocument(): Document {
    const base = createDocument();
    const image = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    const text = createSection({ type: 'text', x: 60, y: 80, page: 1 }) as TextSection;
    const shape = createSection({
        type: 'shape',
        shape: 'circle',
        x: 220,
        y: 60,
        page: 1,
    }) as ShapeSection;
    return {
        ...base,
        sections: [
            { ...image, id: 'img-1', imageUrl: PLACEHOLDER_PNG, width: 180, height: 120, zIndex: 0 },
            { ...text, id: 'text-1', text: 'Headline', width: 300, height: 60, zIndex: 1 },
            {
                ...shape,
                id: 'shape-1',
                width: 140,
                height: 140,
                fill: '#FCDE9C',
                stroke: '#381D2A',
                strokeWidth: 2,
                zIndex: 2,
            },
        ],
    };
}

/** Seed with ten stacked sections to exercise scroll behavior. */
function manySectionsDocument(): Document {
    const base = createDocument();
    const sections = Array.from({ length: 10 }, (_, i) => {
        const variant = i % 3;
        if (variant === 0) {
            const s = createSection({ x: 30 + i * 8, y: 30 + i * 8, page: 1 }) as ImageSection;
            return {
                ...s,
                id: `img-${i}`,
                imageUrl: PLACEHOLDER_PNG,
                width: 120,
                height: 80,
                zIndex: i,
            };
        }
        if (variant === 1) {
            const s = createSection({ type: 'text', x: 30 + i * 8, y: 30 + i * 8, page: 1 }) as TextSection;
            return { ...s, id: `text-${i}`, text: `Line ${i}`, width: 200, height: 32, zIndex: i };
        }
        const s = createSection({
            type: 'shape',
            shape: 'rect',
            x: 30 + i * 8,
            y: 30 + i * 8,
            page: 1,
        }) as ShapeSection;
        return {
            ...s,
            id: `shape-${i}`,
            width: 120,
            height: 60,
            fill: i % 2 === 0 ? '#FCDE9C' : 'transparent',
            stroke: '#381D2A',
            strokeWidth: 2,
            zIndex: i,
        };
    });
    return { ...base, sections };
}

/** Seed that includes a drawing section so the pen icon appears. */
function withDrawingDocument(): Document {
    const base = createDocument();
    const image = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    const drawing = createSection({ type: 'drawing', x: 60, y: 60, page: 1 }) as DrawingSection;
    return {
        ...base,
        sections: [
            { ...image, id: 'img-1', imageUrl: PLACEHOLDER_PNG, width: 200, height: 140, zIndex: 0 },
            {
                ...drawing,
                id: 'draw-1',
                width: 240,
                height: 180,
                zIndex: 1,
                strokes: [
                    {
                        points: [
                            { x: 10, y: 10 },
                            { x: 80, y: 60 },
                        ],
                        color: '#c97b22',
                        weight: 3,
                    },
                ],
            },
        ],
    };
}

/**
 * Default — three sections of different types (image, text, shape) on
 * page 1, presented in render order with the top of the stack first.
 */
export const Default: Story = {
    render: () => (
        <Editor.Root defaultDocument={mixedDocument()}>
            <div className="flex h-[420px] w-64">
                <Editor.LayerList className="border w-full" />
            </div>
        </Editor.Root>
    ),
};

/**
 * Many sections — ten stacked layers so the panel's scrollable area is
 * exercised. The first row is the topmost layer.
 */
export const ManySections: Story = {
    render: () => (
        <Editor.Root defaultDocument={manySectionsDocument()}>
            <div className="flex h-[360px] w-64">
                <Editor.LayerList className="border w-full" />
            </div>
        </Editor.Root>
    ),
};

/**
 * Includes a drawing section to show the pen icon variant.
 */
export const WithDrawingSection: Story = {
    render: () => (
        <Editor.Root defaultDocument={withDrawingDocument()}>
            <div className="flex h-[360px] w-64">
                <Editor.LayerList className="border w-full" />
            </div>
        </Editor.Root>
    ),
};

/**
 * Composed inside the full editor shell — `LayerList` sits in the right
 * rail next to the canvas. Click a row to select; the canvas's blue
 * outline updates in sync.
 */
export const InEditor: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div className="flex h-[640px] flex-col">
                <Editor.Properties />
                <Editor.Toolbar />
                <div className="flex flex-1 min-h-0">
                    <Editor.Pages />
                    <div className="flex-1 min-w-0">
                        <Editor.Canvas>
                            <Editor.Section />
                        </Editor.Canvas>
                    </div>
                    <Editor.LayerList className="w-64 border-l" />
                </div>
                <Editor.Preview />
            </div>
        </Editor.Root>
    ),
};
