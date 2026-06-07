import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { emptyDocument } from '../helpers/sample-documents';

/**
 * Standalone header children — drop into a custom `Editor.Header` shell or
 * use elsewhere in a layout.
 */
const meta: Meta = {
    title: 'Editor/Header Children',
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={emptyDocument()}>
                <div className="bg-gradient p-4 inline-flex">
                    <Story />
                </div>
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj;

/** Inline document-name input. */
export const DocumentName: Story = {
    render: () => <Editor.DocumentName />,
};

/** Page size select. */
export const PageSizeSelect: Story = {
    render: () => <Editor.PageSizeSelect />,
};

/** Orientation select (portrait/landscape). */
export const OrientationSelect: Story = {
    render: () => <Editor.OrientationSelect />,
};
