import type { Meta, StoryObj } from '@storybook/react';
import { createDocument, createSection } from '@docmosaic/core';
import type { Document, ImageSection } from '@docmosaic/core';
import { Editor } from '@docmosaic/react';

/**
 * `Editor.Guides` — ruler-dragged alignment lines. Drag from the top ruler
 * to drop a vertical guide; drag from the left ruler to drop a horizontal
 * one. Sections snap to the guides during multi-select group drag.
 *
 * Requires `Editor.Root showRuler` (rulers are the source of the gesture).
 */
const meta: Meta<typeof Editor.Guides> = {
    title: 'Editor/Guides',
    component: Editor.Guides,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Guides>;

const PLACEHOLDER_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Seed a document with a couple of pre-placed guides so the story shows
 * the visible dashed lines + delete affordance without requiring a drag.
 */
function documentWithGuides(): Document {
    const base = createDocument();
    const a = createSection({ x: 50, y: 50, page: 1 }) as ImageSection;
    const b = createSection({ x: 250, y: 250, page: 1 }) as ImageSection;
    return {
        ...base,
        pages: base.pages.map((p, idx) =>
            idx === 0
                ? {
                      ...p,
                      guides: { vertical: [120, 300], horizontal: [180] },
                  }
                : p,
        ),
        sections: [
            { ...a, id: 'a', imageUrl: PLACEHOLDER_PNG, width: 160, height: 100 },
            { ...b, id: 'b', imageUrl: PLACEHOLDER_PNG, width: 140, height: 140 },
        ],
    };
}

/**
 * WithRulers — rulers visible, two pre-placed vertical guides, one
 * horizontal guide, and two sections that can be dragged to feel the
 * snap behaviour.
 */
export const WithRulers: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithGuides()} showRuler>
            <div className="flex h-[640px]">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};
