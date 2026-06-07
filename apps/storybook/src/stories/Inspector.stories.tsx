import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.Inspector` is the document-properties bar at the top of the
 * editor. Default layout: document name + page size + orientation, plus a
 * mobile settings sheet. Pass children to fully override.
 */
const meta: Meta<typeof Editor.Inspector> = {
    title: 'Editor/Inspector',
    component: Editor.Inspector,
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
type Story = StoryObj<typeof Editor.Inspector>;

/** Bundled default — name, page size, orientation. */
export const Default: Story = {};

/** Compose just the document-name input into the inspector shell. */
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
