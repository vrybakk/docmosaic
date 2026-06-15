import type { Meta, StoryObj } from '@storybook/react';
import { createDocument, createSection } from '@docmosaic/core';
import type { Document, ImageSection, ShapeSection, TextSection } from '@docmosaic/core';
import { Editor, useEditor } from '@docmosaic/react';
import { useEffect } from 'react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.PropertiesPanel` is the contextual right-side panel that reflects
 * and edits the properties of the currently selected section(s). It composes
 * three sub-sections — `Layout` (always visible), `Text` / `Shape` (visible
 * when every selected section shares that type), and `Layer` (single-select
 * only) — plus a default `EmptyState` when nothing is selected.
 *
 * Stories below seed sample sections and pre-select them with a small `Probe`
 * component so the panel renders in each configuration without manual
 * clicking.
 */
const meta: Meta<typeof Editor.PropertiesPanel> = {
    title: 'Editor/Properties Panel',
    component: Editor.PropertiesPanel,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.PropertiesPanel>;

/** Pre-select one or more section ids the moment the panel mounts. */
function SelectIds({ ids }: { ids: ReadonlyArray<string> }) {
    const { ui } = useEditor();
    useEffect(() => {
        if (ids.length === 0) return;
        ui.selectMany(ids);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}

const imageSection = (() => {
    const base = createSection({ x: 60, y: 80, page: 1 }) as ImageSection;
    return { ...base, id: 'image-1', width: 200, height: 140 };
})();

const textSection = (() => {
    const base = createSection({ type: 'text', x: 60, y: 80, page: 1 }) as TextSection;
    return {
        ...base,
        id: 'text-1',
        text: 'Heading',
        fontSize: 24,
        width: 320,
        height: 60,
    };
})();

const shapeSection = (() => {
    const base = createSection({
        type: 'shape',
        shape: 'rect',
        x: 80,
        y: 80,
        page: 1,
    }) as ShapeSection;
    return {
        ...base,
        id: 'shape-1',
        width: 200,
        height: 140,
        stroke: '#381D2A',
        strokeWidth: 2,
        fill: '#FCDE9C',
        opacity: 0.9,
    };
})();

function panelOnly(sections: Array<ImageSection | TextSection | ShapeSection>): Document {
    return {
        ...createDocument(),
        sections,
    };
}

/**
 * No section selected — the panel renders its bundled `EmptyState` hint.
 */
export const Empty: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([imageSection])}>
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l" />
            </div>
        </Editor.Root>
    ),
};

/**
 * One image section selected — Layout + Layer render; type-specific
 * sub-sections stay hidden because the section has no `Text` or `Shape`
 * properties.
 */
export const WithImageSelected: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([imageSection])}>
            <SelectIds ids={[imageSection.id]} />
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l" />
            </div>
        </Editor.Root>
    ),
};

/**
 * One text section selected — Layout + Text + Layer all render. The Text
 * sub-section surfaces font family / size / weight / style / color / align.
 */
export const WithTextSelected: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([textSection])}>
            <SelectIds ids={[textSection.id]} />
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l" />
            </div>
        </Editor.Root>
    ),
};

/**
 * One shape section selected — Layout + Shape (Styles) + Layer all render.
 * Sliders adjust stroke width and opacity in real time.
 */
export const WithShapeSelected: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([shapeSection])}>
            <SelectIds ids={[shapeSection.id]} />
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l" />
            </div>
        </Editor.Root>
    ),
};

/**
 * Two text sections selected. Layout + Text render because every selection
 * shares the text type. Layer is hidden — z-index ops apply to a single
 * section at a time. The visible field values come from the first section in
 * the selection set; committing applies the new value to every selected one.
 */
export const MultiSelectCommonType: Story = {
    render: () => {
        const a: TextSection = { ...textSection, id: 'text-a' };
        const b: TextSection = {
            ...textSection,
            id: 'text-b',
            y: 200,
            text: 'Subhead',
            fontSize: 18,
        };
        return (
            <Editor.Root defaultDocument={panelOnly([a, b])}>
                <SelectIds ids={[a.id, b.id]} />
                <div className="flex h-[480px]">
                    <Editor.PropertiesPanel className="border-l" />
                </div>
            </Editor.Root>
        );
    },
};

/**
 * Image + text selected. Only Layout renders because every selected section
 * carries `x`/`y`/`width`/`height`; Text + Layer are hidden because the
 * selection set has no shared type and Layer needs a single section.
 */
export const MultiSelectHeterogeneous: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([imageSection, textSection])}>
            <SelectIds ids={[imageSection.id, textSection.id]} />
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l" />
            </div>
        </Editor.Root>
    ),
};

/**
 * Full editor shell with the panel docked to the right rail next to the
 * canvas. Mirrors the consumer-facing layout: Properties on top, Toolbar
 * below, Pages on the left, Canvas in the middle, PropertiesPanel on the
 * right. Click a section in the canvas to see the panel update.
 */
export const InEditor: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
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
                    <Editor.PropertiesPanel className="border-l" />
                </div>
                <Editor.Preview />
            </div>
        </Editor.Root>
    ),
};

/**
 * Customize the panel by passing children — bundled sub-sections are
 * available as compound members (`PropertiesPanel.Layout`,
 * `PropertiesPanel.Text`, `PropertiesPanel.Shape`, `PropertiesPanel.Layer`).
 * Reorder them, drop some, or add your own fields alongside.
 */
export const CustomComposition: Story = {
    render: () => (
        <Editor.Root defaultDocument={panelOnly([textSection])}>
            <SelectIds ids={[textSection.id]} />
            <div className="flex h-[480px]">
                <Editor.PropertiesPanel className="border-l">
                    <Editor.PropertiesPanel.Layer />
                    <Editor.PropertiesPanel.Text />
                    <Editor.PropertiesPanel.Layout />
                </Editor.PropertiesPanel>
            </div>
        </Editor.Root>
    ),
};
