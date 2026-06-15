import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections, emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.Zoom` — public five-button zoom widget.
 *
 * Wraps the {@link Editor.useEditorZoom} hook so consumers can drop a polished
 * zoom strip into any custom Canvas surround. Must be a child of
 * `Editor.Canvas` so it can read the canvas viewport context — it opts into
 * Canvas's overlay slot via the `__editorCanvasOverlay` marker so it doesn't
 * compete with the section template.
 */
const meta: Meta<typeof Editor.Zoom> = {
    title: 'Editor/Zoom',
    component: Editor.Zoom,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story, ctx) => {
            const doc = ctx.parameters.doc ?? documentWithSections();
            return (
                <Editor.Root defaultDocument={doc}>
                    <div style={{ height: '500px', display: 'flex' }}>
                        <Editor.Canvas>
                            <Editor.Section />
                            <Story />
                        </Editor.Canvas>
                    </div>
                </Editor.Root>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof Editor.Zoom>;

/** Default — anchored to the bottom of the canvas viewport. */
export const Default: Story = {};

/** Mounted over an empty document to show the zoom strip without sections. */
export const Empty: Story = {
    parameters: { doc: emptyDocument() },
};
