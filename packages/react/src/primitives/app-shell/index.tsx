'use client';

import { useRef, useState, type ReactNode } from 'react';
import {
    Panel,
    PanelGroup,
    PanelResizeHandle,
    type ImperativePanelHandle,
} from 'react-resizable-panels';
import { cn } from '../../internal/utils';
import { Canvas } from '../canvas';
import { ContextMenu } from '../context-menu';
import { KeybindingHelp } from '../keybinding-help';
import { Preview } from '../preview';
import { Section } from '../section';
import { Toaster } from '../toaster';
import { Zoom } from '../zoom';
import { Inspector } from './inspector';
import { LeftRail } from './left-rail';
import { TopBar } from './top-bar';

export interface EditorShellProps {
    /** Host-injected theme toggle node rendered in the top-bar right group. */
    themeToggle?: ReactNode;
    /** Show the left rail (tool palette + Pages + Layers). Defaults to `true`. */
    showLeftRail?: boolean;
    /** Show the tool palette inside the left rail. Defaults to `true`. */
    showToolPalette?: boolean;
    /** Show the "Pages" section inside the left rail. Defaults to `true`. */
    showPages?: boolean;
    /** Show the "Layers" section inside the left rail. Defaults to `true`. */
    showLayers?: boolean;
    /** Show the right inspector panel. Defaults to `true`. */
    showInspector?: boolean;
    /**
     * Extra nodes rendered after the shell — custom dialogs, toasters, or
     * other overlays passed through `Editor.Root`'s `children`.
     */
    children?: ReactNode;
}

/** Subtle shadcn-style 1px resize handle with hover / drag accents. */
function ResizeHandle() {
    return (
        <PanelResizeHandle
            className={cn(
                'relative w-px bg-border outline-none transition-colors',
                'cursor-col-resize hover:bg-ring',
                'data-[resize-handle-state=drag]:bg-ring data-[resize-handle-state=hover]:bg-ring',
                'focus-visible:bg-ring',
            )}
        />
    );
}

/**
 * Figma/Canva/shadcn-style resizable app shell — the default layout rendered
 * by `Editor.Root`.
 *
 * A full-height column: a top bar, then a horizontal three-panel workspace
 * (left rail · canvas · inspector) wired with `react-resizable-panels`, with
 * the toaster, keybinding-help dialog, and preview dialog mounted once as
 * overlays. Every panel primitive reads from the editor context, so the shell
 * itself only forwards display toggles and the host theme-toggle slot.
 */
export function EditorShell({
    themeToggle,
    showLeftRail = true,
    showToolPalette = true,
    showPages = true,
    showLayers = true,
    showInspector = true,
    children,
}: EditorShellProps) {
    const leftPanelRef = useRef<ImperativePanelHandle>(null);
    const inspectorPanelRef = useRef<ImperativePanelHandle>(null);
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

    const toggle = (panel: ImperativePanelHandle | null) => {
        if (!panel) return;
        if (panel.isCollapsed()) panel.expand();
        else panel.collapse();
    };

    return (
        <div className="flex h-screen flex-col bg-background text-foreground">
            <TopBar
                themeToggle={themeToggle}
                onToggleLeftRail={showLeftRail ? () => toggle(leftPanelRef.current) : undefined}
                leftRailCollapsed={leftCollapsed}
                onToggleInspector={
                    showInspector ? () => toggle(inspectorPanelRef.current) : undefined
                }
                inspectorCollapsed={inspectorCollapsed}
            />

            <div className="min-h-0 flex-1">
                <PanelGroup direction="horizontal" className="h-full">
                    {showLeftRail ? (
                        <>
                            <Panel
                                id="left-rail"
                                order={1}
                                ref={leftPanelRef}
                                collapsible
                                collapsedSize={0}
                                defaultSize={17}
                                minSize={13}
                                maxSize={28}
                                onCollapse={() => setLeftCollapsed(true)}
                                onExpand={() => setLeftCollapsed(false)}
                                className="overflow-hidden"
                            >
                                <LeftRail
                                    showToolPalette={showToolPalette}
                                    showPages={showPages}
                                    showLayers={showLayers}
                                />
                            </Panel>
                            <ResizeHandle />
                        </>
                    ) : null}

                    <Panel id="canvas" order={2} defaultSize={63}>
                        <div className="flex h-full min-h-0 flex-col bg-muted">
                            <ContextMenu className="flex min-h-0 flex-1">
                                {/* One zoom control only: the built-in top-right
                                    strip is suppressed (`showControls={false}`)
                                    in favor of the bottom-center pill below. */}
                                <Canvas showControls={false}>
                                    <Section />
                                    <Zoom />
                                </Canvas>
                            </ContextMenu>
                        </div>
                    </Panel>

                    {showInspector ? (
                        <>
                            <ResizeHandle />
                            <Panel
                                id="inspector"
                                order={3}
                                ref={inspectorPanelRef}
                                collapsible
                                collapsedSize={0}
                                defaultSize={20}
                                minSize={14}
                                maxSize={32}
                                onCollapse={() => setInspectorCollapsed(true)}
                                onExpand={() => setInspectorCollapsed(false)}
                                className="overflow-hidden"
                            >
                                <Inspector />
                            </Panel>
                        </>
                    ) : null}
                </PanelGroup>
            </div>

            <Toaster />
            <KeybindingHelp />
            <Preview />
            {children}
        </div>
    );
}
