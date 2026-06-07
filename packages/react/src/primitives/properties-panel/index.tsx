'use client';

import { Children, type ReactNode } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { EmptyState } from './empty-state';
import { LayerSection } from './layer-section';
import { LayoutSection } from './layout-section';
import { ShapeSectionProperties } from './shape-section';
import { TextSectionProperties } from './text-section';

interface PropertiesPanelProps {
    /**
     * Optional children. When provided, the panel renders them as the body —
     * useful for custom compositions that swap sub-sections or add their own
     * fields. When omitted, the panel falls back to the bundled default
     * arrangement: `LayoutSection`, type-specific section (Text / Shape),
     * then `LayerSection`. An empty selection always renders the
     * {@link EmptyState} regardless of children.
     */
    children?: ReactNode;
    className?: string;
}

/**
 * Contextual right-side panel that reflects and edits the properties of the
 * currently selected section(s). Designed to be dropped into any layout
 * around `Editor.Root` — it doesn't claim a fixed position itself.
 *
 * Sub-sections:
 * - {@link LayoutSection} — `x`, `y`, `width`, `height` (every section type).
 * - {@link TextSectionProperties} — font family/size/weight/style/color/align.
 *   Visible only when every selected section is a {@link TextSection}.
 * - {@link ShapeSectionProperties} — fill, stroke, stroke width, opacity.
 *   Visible only when every selected section is a {@link ShapeSection}.
 * - {@link LayerSection} — bring-to-front / send-to-back actions. Hidden
 *   while multi-select is active.
 *
 * In multi-select, sub-sections only render when the property they expose
 * applies to *every* selected section — Layout always does, type-specific
 * sub-sections require the whole selection to share a `type`, and Layer is
 * hidden until exactly one section is selected.
 *
 * @example Right rail next to the canvas
 * ```tsx
 * <Editor.Root>
 *   <Editor.Properties />
 *   <Editor.Toolbar />
 *   <Editor.Pages />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.PropertiesPanel className="w-72 border-l" />
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 *
 * @example Custom composition with reordered sections
 * ```tsx
 * <Editor.PropertiesPanel>
 *   <Editor.PropertiesPanel.Layer />
 *   <Editor.PropertiesPanel.Layout />
 * </Editor.PropertiesPanel>
 * ```
 */
export function PropertiesPanel({ children, className }: PropertiesPanelProps = {}) {
    const { ui } = useEditor();
    const isEmpty = ui.selectedSectionIds.size === 0;

    return (
        <aside
            className={cn(
                'flex flex-col max-w-72 w-full bg-editor-surface text-editor-text',
                'border-editor-accent/10',
                className,
            )}
            data-properties-panel="true"
            aria-label="Properties"
        >
            {isEmpty ? (
                <EmptyState />
            ) : children !== undefined && Children.count(children) > 0 ? (
                children
            ) : (
                <>
                    <LayoutSection />
                    <TextSectionProperties />
                    <ShapeSectionProperties />
                    <LayerSection />
                </>
            )}
        </aside>
    );
}

PropertiesPanel.Layout = LayoutSection;
PropertiesPanel.Layer = LayerSection;
PropertiesPanel.Text = TextSectionProperties;
PropertiesPanel.Shape = ShapeSectionProperties;
PropertiesPanel.EmptyState = EmptyState;
