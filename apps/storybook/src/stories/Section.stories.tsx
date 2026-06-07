import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections, emptyDocument } from '../helpers/sample-documents';
import { createSection, type Document } from '@docmosaic/core';

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
        const placeholder = createSection(40, 40, 1);
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
