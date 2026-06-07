import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import {
    documentWithPageBackground,
    documentWithSections,
    emptyDocument,
} from '../helpers/sample-documents';

/**
 * `Editor.PageBackgroundPicker` drives the `setPageBackground` action — a
 * color swatch + image uploader for the active page. Combine with
 * `Editor.Canvas` to see the background paint behind sections.
 */
const meta: Meta<typeof Editor.PageBackgroundPicker> = {
    title: 'Editor/PageBackgroundPicker',
    component: Editor.PageBackgroundPicker,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.PageBackgroundPicker>;

/** Empty page — pick a color or upload an image to set the background. */
export const Empty: Story = {
    render: () => (
        <Editor.Root defaultDocument={emptyDocument()}>
            <div style={{ padding: 16 }}>
                <Editor.PageBackgroundPicker />
            </div>
            <div style={{ height: '500px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Page seeded with a cream background — picker reflects the active color. */
export const WithColor: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithPageBackground('#fff7e6')}>
            <div style={{ padding: 16 }}>
                <Editor.PageBackgroundPicker />
            </div>
            <div style={{ height: '500px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Picker alongside a document carrying two image sections. */
export const NextToCanvas: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div style={{ padding: 16 }}>
                <Editor.PageBackgroundPicker />
            </div>
            <div style={{ height: '500px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};
