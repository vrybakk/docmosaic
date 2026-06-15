import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Editor, useEditor, type SnapGuide } from '@docmosaic/react';

import { documentWithThreeSections } from '../helpers/sample-documents';

/**
 * Phase 16 — multi-select, group bounds, and snap guides.
 *
 * The Canvas hosts `Editor.SelectionBounds` (group bbox + 8 resize handles)
 * and `Editor.SnapGuides` (visual guide lines while a group is dragged).
 * Each primitive reads everything it needs from `useEditor` — these stories
 * just pre-populate the selection or the snap-guide state so the visual is
 * reproducible without dragging.
 */
const meta: Meta = {
    title: 'Editor/Selection',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj;

/**
 * Pre-select every section in the document so the dashed group bbox + 8
 * group resize handles render. Drag a handle to scale the whole group.
 */
function SelectAll() {
    const editor = useEditor();
    useEffect(() => {
        editor.ui.selectMany(editor.state.sections.map((s) => s.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}

export const SelectionBounds: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithThreeSections()}>
            <SelectAll />
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/**
 * Inject a couple of snap guides into `ui.activeSnapGuides` so the
 * `Editor.SnapGuides` primitive paints lines without a live drag.
 * Positions are in display pixels and aligned to the page midlines.
 */
function ForceGuides({ guides }: { guides: SnapGuide[] }) {
    const editor = useEditor();
    useEffect(() => {
        editor.ui.setActiveSnapGuides(guides);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}

export const SnapGuides: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithThreeSections()}>
            <ForceGuides
                guides={[
                    { orientation: 'vertical', position: 200, label: 'page-center' },
                    { orientation: 'horizontal', position: 150, label: 'section-top' },
                ]}
            />
            <div style={{ height: '600px', display: 'flex' }}>
                <Editor.Canvas>
                    <Editor.Section />
                </Editor.Canvas>
            </div>
        </Editor.Root>
    ),
};

/**
 * Multi-select interaction. The canvas accepts shift+click to grow the
 * selection or a drag-to-marquee on empty space; both paths set the same
 * `ui.selectedSectionIds` set used by `Editor.SelectionBounds`.
 */
export const MultiSelectInteraction: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithThreeSections()}>
            <Editor.Properties />
            <Editor.Toolbar />
            <Editor.Pages />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
            <Editor.Preview />
        </Editor.Root>
    ),
};
