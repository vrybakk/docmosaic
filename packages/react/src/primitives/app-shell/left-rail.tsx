'use client';

import { useEditor } from '../../context/editor';
import { ScrollArea } from '../../ui/scroll-area';
import { LayerList } from '../layer-list';
import { Pages } from '../pages';
import { AddImageButton } from '../toolbar/add-image-button';
import { AddTextButton } from '../toolbar/add-text-button';
import { DrawButton } from '../toolbar/draw-button';
import { SelectToolButton } from '../toolbar/select-tool-button';
import { ShapeToolButton } from '../toolbar/shape-tool-button';
import { CollapsibleSection } from './section-label';

/**
 * Subtle monochrome styling shared by every tool-palette icon button — a
 * ghost button that reads as muted at rest and lifts to `accent` on hover.
 * Passed through the toolbar primitives' `variant` + `className` props so the
 * bright `caramel`/`orange` defaults never reach the shell.
 */
const TOOL_BUTTON_CLASS =
    'h-9 w-9 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground';
/** Subtly-filled active state — the single accent in the calm palette. */
const TOOL_BUTTON_ACTIVE_CLASS =
    'h-9 w-9 shrink-0 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground';

interface LeftRailProps {
    /** Render the add/draw tool palette above the panels. Defaults to `true`. */
    showToolPalette?: boolean;
    /** Render the collapsible "Pages" section. Defaults to `true`. */
    showPages?: boolean;
    /** Render the collapsible "Layers" section. Defaults to `true`. */
    showLayers?: boolean;
}

/**
 * Left rail of the editor shell — a tool palette on top of a scrollable
 * column with collapsible "Pages" and "Layers" sections. Each control reads
 * from the editor context; the palette hides itself in read-only mode (its
 * buttons already return `null`, and the surrounding grid is suppressed so no
 * empty box is left behind).
 */
export function LeftRail({
    showToolPalette = true,
    showPages = true,
    showLayers = true,
}: LeftRailProps) {
    const { readOnly } = useEditor();
    const palette = showToolPalette && !readOnly;

    return (
        <div className="flex h-full min-h-0 flex-col border-r border-border bg-card">
            {palette ? (
                <div className="flex items-center gap-1 border-b border-border p-2">
                    <SelectToolButton
                        iconOnly
                        variant="ghost"
                        activeVariant="secondary"
                        className={TOOL_BUTTON_CLASS}
                        activeClassName={TOOL_BUTTON_ACTIVE_CLASS}
                    />
                    <AddImageButton iconOnly variant="ghost" className={TOOL_BUTTON_CLASS} />
                    <AddTextButton iconOnly variant="ghost" className={TOOL_BUTTON_CLASS} />
                    <ShapeToolButton
                        iconOnly
                        variant="ghost"
                        activeVariant="secondary"
                        className={TOOL_BUTTON_CLASS}
                        activeClassName={TOOL_BUTTON_ACTIVE_CLASS}
                    />
                    <DrawButton
                        iconOnly
                        variant="ghost"
                        activeVariant="secondary"
                        className={TOOL_BUTTON_CLASS}
                        activeClassName={TOOL_BUTTON_ACTIVE_CLASS}
                    />
                </div>
            ) : null}

            <ScrollArea className="flex-1">
                <div className="divide-y divide-border">
                    {showPages ? (
                        <CollapsibleSection label="Pages">
                            <Pages bare />
                        </CollapsibleSection>
                    ) : null}
                    {showLayers ? (
                        <CollapsibleSection label="Layers">
                            <LayerList title="" />
                        </CollapsibleSection>
                    ) : null}
                </div>
            </ScrollArea>
        </div>
    );
}
