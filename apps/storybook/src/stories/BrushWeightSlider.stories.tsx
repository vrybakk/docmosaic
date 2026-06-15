import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';
import { useState } from 'react';

/**
 * `Editor.BrushWeightSlider` — slider for picking a brush thickness between
 * 1 and 20 PDF points, paired with a circular preview that scales with the
 * current value.
 *
 * Stateless: pass the active weight via `value` and listen via `onChange`.
 * Composed by `Editor.DrawingControls` to drive the editor's `ui.drawingWeight`.
 */
const meta: Meta<typeof Editor.BrushWeightSlider> = {
    title: 'Editor/BrushWeightSlider',
    component: Editor.BrushWeightSlider,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Editor.BrushWeightSlider>;

function Wrapped(initial: number, color = '#000000') {
    return function StoryComponent() {
        const [weight, setWeight] = useState(initial);
        return (
            <div className="p-4 inline-flex">
                <Editor.BrushWeightSlider
                    value={weight}
                    onChange={setWeight}
                    previewColor={color}
                />
            </div>
        );
    };
}

/** Default — thin brush at 1pt. */
export const Thin: Story = {
    render: Wrapped(1),
};

/** Mid-range — 10pt brush. */
export const Medium: Story = {
    render: Wrapped(10),
};

/** Max — 20pt brush. */
export const Thick: Story = {
    render: Wrapped(20),
};

/** Colored preview circle — feed `previewColor` to match the active brush. */
export const Colored: Story = {
    render: Wrapped(8, '#c97b22'),
};
