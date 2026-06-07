import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithDrawingSection, emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.DrawingControls` — composed drawing-mode side panel. Pairs
 * `Editor.ColorPicker` + `Editor.BrushWeightSlider` with "Clear" and "Done"
 * actions so the user has a single, opinionated surface for drawing-mode UX.
 *
 * Reads `ui.drawingColor` / `ui.drawingWeight` / `ui.selectedSectionId` from
 * the editor context; "Clear" calls `actions.clearStrokes`; "Done" turns
 * drawing mode off.
 */
const meta: Meta<typeof Editor.DrawingControls> = {
    title: 'Editor/DrawingControls',
    component: Editor.DrawingControls,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Editor.DrawingControls>;

/** Default — empty document, no selected drawing yet. "Clear" is disabled. */
export const Default: Story = {
    render: () => (
        <Editor.Root defaultDocument={emptyDocument()}>
            <div className="p-4 inline-flex">
                <Editor.DrawingControls />
            </div>
        </Editor.Root>
    ),
};

/**
 * Composed alongside a Canvas that already has a drawing section — selecting
 * the section enables the "Clear" button.
 */
export const NextToCanvas: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithDrawingSection()}>
            <div style={{ height: '600px', display: 'flex', gap: 16 }}>
                <Editor.DrawingControls />
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};
