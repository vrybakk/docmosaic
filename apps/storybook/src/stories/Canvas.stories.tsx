import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections, emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.Canvas` is the interactive workspace. It auto-fits the page,
 * accepts section drops, and renders one section template per
 * `Document.sections`. Reads everything from `useEditor`.
 */
const meta: Meta<typeof Editor.Canvas> = {
    title: 'Editor/Canvas',
    component: Editor.Canvas,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story, ctx) => {
            const doc = ctx.parameters.doc ?? emptyDocument();
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
type Story = StoryObj<typeof Editor.Canvas>;

/** Empty canvas — no sections placed yet. */
export const Default: Story = {
    parameters: { doc: emptyDocument() },
};

/** Canvas pre-populated with two image sections. */
export const WithSections: Story = {
    parameters: { doc: documentWithSections() },
};

/**
 * Drop a file onto the canvas to attach it to the active drop target. This
 * story shows the drop overlay UI; use the interactions panel to simulate
 * `react-dnd` drops with `act()`.
 */
export const FileDropTarget: Story = {
    parameters: { doc: documentWithSections() },
    name: 'File drop target',
};
