import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';
import { useState } from 'react';

/**
 * `Editor.ColorPicker` — presentational color picker with a 12-color preset
 * palette and a custom-color trigger that opens a native `<input type="color">`.
 *
 * Stateless: pass the active color via `value` and listen via `onChange`.
 * Composed by `Editor.DrawingControls` to drive the editor's `ui.drawingColor`.
 */
const meta: Meta<typeof Editor.ColorPicker> = {
    title: 'Editor/ColorPicker',
    component: Editor.ColorPicker,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Editor.ColorPicker>;

function Wrapped(initial: string) {
    return function StoryComponent() {
        const [color, setColor] = useState(initial);
        return (
            <div className="p-4 inline-flex flex-col gap-3 items-start">
                <Editor.ColorPicker value={color} onChange={setColor} />
                <div className="flex items-center gap-2 text-sm">
                    <div
                        className="h-5 w-5 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                    />
                    <code>{color}</code>
                </div>
            </div>
        );
    };
}

/** Default preset palette — 12 colors with neutrals + rainbow. */
export const Default: Story = {
    render: Wrapped('#000000'),
};

/** With a preset already active — the matching swatch is highlighted. */
export const ActiveSwatch: Story = {
    render: Wrapped('#3B82F6'),
};

/** Showing the custom-color flow — click the `+` to open the native picker. */
export const CustomColorOpen: Story = {
    render: Wrapped('#abcdef'),
};

/** Custom preset list — pass any colors you like. */
export const CustomPresets: Story = {
    render: function CustomPresetsStory() {
        const [color, setColor] = useState('#c97b22');
        return (
            <div className="p-4 inline-flex">
                <Editor.ColorPicker
                    value={color}
                    onChange={setColor}
                    presets={['#c97b22', '#3b6e3b', '#1f5d8c', '#9b1f3f', '#3a3a3a', '#fefefe']}
                />
            </div>
        );
    },
};
