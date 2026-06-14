'use client';

import { Files, Layers, SlidersHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useEditor } from '../../context/editor';
import { Sheet, SheetContent } from '../../ui/sheet';
import { Canvas } from '../canvas';
import { ContextMenu } from '../context-menu';
import { KeybindingHelp } from '../keybinding-help';
import { LayerList } from '../layer-list';
import { Pages } from '../pages';
import { Preview } from '../preview';
import { PropertiesPanel } from '../properties-panel';
import { Section } from '../section';
import { Toaster } from '../toaster';
import { AddImageButton } from '../toolbar/add-image-button';
import { AddTextButton } from '../toolbar/add-text-button';
import { DrawButton } from '../toolbar/draw-button';
import { FrameToolButton } from '../toolbar/frame-tool-button';
import { ImageFrameToolButton } from '../toolbar/image-frame-tool-button';
import { SelectToolButton } from '../toolbar/select-tool-button';
import { ShapeToolButton } from '../toolbar/shape-tool-button';
import { Zoom } from '../zoom';
import type { EditorShellProps } from './index';
import { TopBar } from './top-bar';

/** Finger-friendly tool button — 40px, ghost at rest, accent-filled when armed. */
const TOOL =
    'h-10 w-10 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground';
const TOOL_ACTIVE =
    'h-10 w-10 shrink-0 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground';

type MobileSheet = 'pages' | 'layers' | 'properties';

/** Bottom-bar button that opens one of the panel sheets. */
function PanelButton({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-12 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

/**
 * Phone/tablet layout for the editor shell: a full-bleed canvas with a bottom
 * tool bar, and the Pages / Layers / Properties panels surfaced as slide-up
 * bottom sheets. Rendered by {@link EditorShell} below the desktop breakpoint.
 */
export function MobileEditorShell({
    themeToggle,
    showToolPalette = true,
    showPages = true,
    showLayers = true,
    showInspector = true,
    children,
}: EditorShellProps) {
    const { readOnly } = useEditor();
    const [sheet, setSheet] = useState<MobileSheet | null>(null);
    const palette = showToolPalette && !readOnly;

    return (
        <div className="flex h-screen flex-col bg-background text-foreground">
            <TopBar themeToggle={themeToggle} />

            <div className="relative min-h-0 flex-1 bg-muted">
                <ContextMenu className="flex h-full min-h-0">
                    <Canvas showControls={false}>
                        <Section />
                        <Zoom />
                    </Canvas>
                </ContextMenu>
            </div>

            {/* Bottom bar: tools (scrollable) + panel sheet triggers. */}
            <div className="flex items-center gap-1 border-t border-border bg-card px-2 py-1.5">
                {palette ? (
                    <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                        <SelectToolButton
                            iconOnly
                            variant="ghost"
                            activeVariant="secondary"
                            className={TOOL}
                            activeClassName={TOOL_ACTIVE}
                        />
                        <AddImageButton iconOnly variant="ghost" className={TOOL} />
                        <AddTextButton iconOnly variant="ghost" className={TOOL} />
                        <ShapeToolButton
                            iconOnly
                            variant="ghost"
                            activeVariant="secondary"
                            className={TOOL}
                            activeClassName={TOOL_ACTIVE}
                        />
                        <FrameToolButton
                            iconOnly
                            variant="ghost"
                            activeVariant="secondary"
                            className={TOOL}
                            activeClassName={TOOL_ACTIVE}
                        />
                        <ImageFrameToolButton
                            iconOnly
                            variant="ghost"
                            activeVariant="secondary"
                            className={TOOL}
                            activeClassName={TOOL_ACTIVE}
                        />
                        <DrawButton
                            iconOnly
                            variant="ghost"
                            activeVariant="secondary"
                            className={TOOL}
                            activeClassName={TOOL_ACTIVE}
                        />
                    </div>
                ) : (
                    <div className="flex-1" />
                )}

                <div className="flex shrink-0 items-center gap-1 border-l border-border pl-1">
                    {showPages ? (
                        <PanelButton
                            label="Pages"
                            icon={<Files className="h-5 w-5" />}
                            onClick={() => setSheet('pages')}
                        />
                    ) : null}
                    {showLayers ? (
                        <PanelButton
                            label="Layers"
                            icon={<Layers className="h-5 w-5" />}
                            onClick={() => setSheet('layers')}
                        />
                    ) : null}
                    {showInspector ? (
                        <PanelButton
                            label="Edit"
                            icon={<SlidersHorizontal className="h-5 w-5" />}
                            onClick={() => setSheet('properties')}
                        />
                    ) : null}
                </div>
            </div>

            <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
                <SheetContent
                    side="bottom"
                    className="max-h-[75vh] overflow-y-auto rounded-t-2xl p-0 pt-3"
                >
                    {sheet === 'pages' && <Pages bare />}
                    {sheet === 'layers' && <LayerList title="Layers" />}
                    {sheet === 'properties' && (
                        <PropertiesPanel className="max-w-none border-0 bg-transparent" />
                    )}
                </SheetContent>
            </Sheet>

            <Toaster />
            <KeybindingHelp />
            <Preview />
            {children}
        </div>
    );
}
