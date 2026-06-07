import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import {
    documentWithSections,
    documentWithShapeSection,
    documentWithTextSection,
    emptyDocument,
} from '../helpers/sample-documents';
import {
    createSection,
    type Document,
    type TextSection as TextSectionData,
} from '@docmosaic/core';

/**
 * `Editor.Section` is the per-section primitive: empty placeholder, image,
 * resize handles, and the section toolbar. Reads its state from
 * `useEditorSection`, set up by `Editor.Canvas`.
 */
const meta: Meta<typeof Editor.Section> = {
    title: 'Editor/Section',
    component: Editor.Section,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Section>;

/** Section with no image — shows the empty-state upload prompt. */
export const EmptyPlaceholder: Story = {
    render: () => {
        const base = emptyDocument();
        const placeholder = createSection({ x: 40, y: 40, page: 1 });
        const doc: Document = { ...base, sections: [placeholder] };
        return (
            <Editor.Root defaultDocument={doc}>
                <div style={{ height: '600px', display: 'flex' }}>
                    <Editor.Canvas>
                        <Editor.Section />
                    </Editor.Canvas>
                </div>
            </Editor.Root>
        );
    },
};

/** Section with an image attached. */
export const WithImage: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/**
 * Selected section — the per-section toolbar (duplicate / delete / layer
 * order) is visible because `ui.selectedSectionId` matches.
 */
export const Selected: Story = {
    render: () => {
        const doc = documentWithSections();
        const seeded: Document = { ...doc };
        return (
            <Editor.Root defaultDocument={seeded}>
                <div style={{ height: '600px', display: 'flex' }}>
                    <Editor.Canvas>
                        <Editor.Section />
                    </Editor.Canvas>
                </div>
            </Editor.Root>
        );
    },
};

/** Drag preview — drag the section to reposition it. */
export const Dragging: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Empty text section — shows the "Double-click to edit" hint. */
export const TextPlaceholder: Story = {
    render: () => {
        const base = emptyDocument();
        const placeholder = createSection({ type: 'text', x: 60, y: 60, page: 1 }) as TextSectionData;
        const doc: Document = {
            ...base,
            sections: [{ ...placeholder, width: 320, height: 80 }],
        };
        return (
            <Editor.Root defaultDocument={doc}>
                <div style={{ height: '600px', display: 'flex' }}>
                    <Editor.Canvas>
                        <Editor.Section />
                    </Editor.Canvas>
                </div>
            </Editor.Root>
        );
    },
};

/** Text section seeded with body copy. */
export const TextWithContent: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithTextSection('Hello DocMosaic')}>
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Selected text section — the typography toolbar (alignment, bold, italic,
 * font size) is visible. */
export const TextSelected: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithTextSection('Selected text')}>
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Text section in editing mode (double-click the section to type inline). */
export const TextEditing: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithTextSection('Double-click to edit me')}>
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Rectangle shape — stroke-only by default. */
export const ShapeRectangle: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithShapeSection('rect', {
                stroke: '#c97b22',
                strokeWidth: 2,
            })}
        >
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Rectangle with a filled body. */
export const ShapeRectangleFilled: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithShapeSection('rect', {
                fill: '#fff7e6',
                stroke: '#c97b22',
                strokeWidth: 2,
            })}
        >
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Circle (ellipse inscribed in the section box). */
export const ShapeCircle: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithShapeSection('circle', {
                stroke: '#3b6e3b',
                strokeWidth: 3,
                width: 200,
                height: 200,
            })}
        >
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Circle with a tinted fill. */
export const ShapeCircleFilled: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithShapeSection('circle', {
                fill: '#e6f4e6',
                stroke: '#3b6e3b',
                strokeWidth: 2,
                width: 200,
                height: 200,
            })}
        >
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Diagonal line from top-left to bottom-right of the section box. */
export const ShapeLine: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithShapeSection('line', {
                stroke: '#222',
                strokeWidth: 2,
                width: 320,
                height: 4,
            })}
        >
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};
