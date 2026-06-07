import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.Ruler` — top + left edge rulers showing PDF points (or mm/in) and
 * scaled with the canvas zoom.
 *
 * Auto-mounted by `Editor.Root showRuler`; the gutter math is baked into
 * `Editor.Canvas` so the page edge stays flush with the ruler's zero mark.
 */
const meta: Meta<typeof Editor.Ruler> = {
    title: 'Editor/Ruler',
    component: Editor.Ruler,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Ruler>;

/** Default — sample sections plus the auto-mounted rulers on both axes. */
export const Default: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()} showRuler>
            <div className="flex h-[600px]">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Same canvas, but the ruler labels read out in millimeters. */
export const Millimeters: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()} showRuler rulerUnit="mm">
            <div className="flex h-[600px]">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/** Inches variant. */
export const Inches: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()} showRuler rulerUnit="in">
            <div className="flex h-[600px]">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};
