import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithPages } from '../helpers/sample-documents';

/**
 * `Editor.PageList` is the left sidebar. Shows one `PageThumb` per page and
 * supports drag-reorder via native HTML5 drag-and-drop. Reads state from
 * `useEditor`.
 */
const meta: Meta<typeof Editor.PageList> = {
    title: 'Editor/PageList',
    component: Editor.PageList,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story, ctx) => {
            const doc = ctx.parameters.doc ?? documentWithPages(1);
            return (
                <Editor.Root defaultDocument={doc}>
                    <div style={{ height: '600px', display: 'flex' }}>
                        <Story />
                    </div>
                </Editor.Root>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof Editor.PageList>;

/** Single page. */
export const OnePage: Story = {
    parameters: { doc: documentWithPages(1) },
};

/** Five pages — exercises the scroll area. */
export const FivePages: Story = {
    parameters: { doc: documentWithPages(5) },
};

/**
 * Reorder interaction — drag a page thumb up or down to reorder. Stories
 * with `tags: ['interaction']` can be played from the Interactions panel.
 */
export const ReorderInteraction: Story = {
    parameters: { doc: documentWithPages(3) },
    name: 'Reorder interaction',
};
