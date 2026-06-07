import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections, documentWithThreeSections } from '../helpers/sample-documents';

/**
 * `Editor.Minimap` — a thumbnail of the current page anchored to the
 * bottom-right of the canvas viewport. Each section renders as a colored
 * rectangle by type, and the red rectangle represents the visible canvas
 * region (drag it to pan the main canvas).
 *
 * Auto-mounted by `Editor.Root showMinimap`.
 */
const meta: Meta<typeof Editor.Minimap> = {
    title: 'Editor/Minimap',
    component: Editor.Minimap,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Minimap>;

/** Default — two image sections on a single page. */
export const Default: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()} showMinimap>
            <div className="flex h-[600px]">
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/**
 * InEditor — composed with the full editor shell so the minimap sits
 * alongside the toolbar and properties panel. Exercises the live update
 * path: add / move sections via the toolbar and see them mirrored.
 */
export const InEditor: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithThreeSections()} showMinimap showRuler>
            <div className="flex h-[640px] flex-col">
                <Editor.Properties />
                <Editor.Toolbar />
                <div className="flex flex-1 min-h-0">
                    <Editor.Pages />
                    <div className="flex-1 min-w-0">
                        <Editor.Canvas>
                            <Editor.Section />
                        </Editor.Canvas>
                    </div>
                    <Editor.PropertiesPanel />
                </div>
                <Editor.Preview />
            </div>
        </Editor.Root>
    ),
};
