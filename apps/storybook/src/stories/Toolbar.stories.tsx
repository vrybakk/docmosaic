import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.Toolbar` is the top action bar. Default layout includes undo/redo
 * plus the preview/print/download trio. Pass children to fully replace the
 * arrangement.
 */
const meta: Meta<typeof Editor.Toolbar> = {
    title: 'Editor/Toolbar',
    component: Editor.Toolbar,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={documentWithSections()}>
                <Story />
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Editor.Toolbar>;

/** Bundled default — undo/redo, estimated size, preview, print, download. */
export const Default: Story = {};

/** Custom arrangement — only undo/redo. */
export const UndoRedoOnly: Story = {
    args: {
        children: (
            <div className="flex items-center gap-2">
                <Editor.UndoButton />
                <Editor.RedoButton />
            </div>
        ),
    },
};

/** Custom arrangement — caller controls layout entirely. */
export const CustomArrangement: Story = {
    args: {
        children: (
            <div className="flex items-center justify-between gap-4 w-full">
                <Editor.AddSectionButton />
                <div className="flex items-center gap-2">
                    <Editor.UndoButton />
                    <Editor.RedoButton />
                </div>
                <div className="flex items-center gap-2">
                    <Editor.EstimatedSize />
                    <Editor.DownloadButton />
                </div>
            </div>
        ),
    },
};
