import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.Properties` is the document-properties bar at the top of the
 * editor. Default layout: document name + page size + orientation, plus a
 * mobile settings sheet. Pass children to fully override.
 */
const meta: Meta<typeof Editor.Properties> = {
    title: 'Editor/Properties',
    component: Editor.Properties,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={emptyDocument()}>
                <Story />
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Editor.Properties>;

/** Bundled default — name, page size, orientation. */
export const Default: Story = {};

/** Compose just the document-name input into the properties shell. */
export const DocumentNameOnly: Story = {
    args: {
        children: <Editor.DocumentName />,
    },
};

/** Compose just the page-size select. */
export const PageSizeSelectOnly: Story = {
    args: {
        children: <Editor.PageSizeSelect />,
    },
};
