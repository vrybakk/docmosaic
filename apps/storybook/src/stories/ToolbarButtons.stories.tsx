import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * Standalone toolbar buttons. Each is a thin wrapper around the editor
 * context that callers can drop into a custom toolbar arrangement.
 */
const meta: Meta = {
    title: 'Editor/Toolbar Buttons',
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={documentWithSections()}>
                <div className="p-4 inline-flex">
                    <Story />
                </div>
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj;

/** `Editor.UndoButton` — disabled when no history is available. */
export const UndoButton: Story = {
    render: () => <Editor.UndoButton />,
};

/** `Editor.RedoButton` — disabled until something has been undone. */
export const RedoButton: Story = {
    render: () => <Editor.RedoButton />,
};

/** `Editor.PreviewButton` — opens the preview dialog. */
export const PreviewButton: Story = {
    render: () => <Editor.PreviewButton />,
};

/** `Editor.PrintButton` — fires the print pipeline. */
export const PrintButton: Story = {
    render: () => <Editor.PrintButton />,
};

/** `Editor.DownloadButton` — downloads the generated PDF blob. */
export const DownloadButton: Story = {
    render: () => <Editor.DownloadButton />,
};

/** `Editor.AddSectionButton` — appends a new image section to the current page. */
export const AddSectionButton: Story = {
    render: () => <Editor.AddSectionButton />,
};

/** `Editor.AddTextButton` — appends a new text section to the current page. */
export const AddTextButton: Story = {
    render: () => <Editor.AddTextButton />,
};

/** `Editor.AddShapeButton` (rect) — appends a new rectangle. */
export const AddRectangleButton: Story = {
    render: () => <Editor.AddShapeButton shape="rect" />,
};

/** `Editor.AddShapeButton` (circle) — appends a new circle. */
export const AddCircleButton: Story = {
    render: () => <Editor.AddShapeButton shape="circle" />,
};

/** `Editor.AddShapeButton` (line) — appends a new diagonal line. */
export const AddLineButton: Story = {
    render: () => <Editor.AddShapeButton shape="line" />,
};

/** `Editor.EstimatedSize` — projected file size of the current document. */
export const EstimatedSize: Story = {
    render: () => <Editor.EstimatedSize />,
};

/** `Editor.CanvasControls` — zoom in/out/reset, surfaced as a single primitive. */
export const CanvasControls: Story = {
    render: () => <Editor.CanvasControls />,
};
