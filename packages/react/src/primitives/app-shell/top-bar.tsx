'use client';

import { ChevronDown, PanelLeft, PanelRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../internal/utils';
import { DocumentName } from '../properties/document-name';
import { OrientationSelect } from '../properties/orientation-select';
import { PageSizeSelect } from '../properties/page-size-select';
import { DownloadButton } from '../toolbar/download-button';
import { FileSizeBadge } from '../toolbar/file-size-badge';
import { PreviewButton } from '../toolbar/preview-button';
import { PrintButton } from '../toolbar/print-button';
import { RedoButton } from '../toolbar/redo-button';
import { UndoButton } from '../toolbar/undo-button';

/** Thin vertical rule used to group top-bar clusters. */
function Divider() {
    return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

/**
 * Subtle monochrome styling for the top-bar's icon-only action buttons —
 * muted at rest, lifting to `accent` on hover. Layered onto the ghost
 * variant so the bright `white`/`cream`/`sage` defaults never reach the bar.
 */
const ACTION_BUTTON_CLASS =
    'h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground';

interface TopBarProps {
    /**
     * Host-injected theme toggle node. The package never imports `next-themes`;
     * the app passes a ready-made toggle in. Renders nothing when omitted.
     */
    themeToggle?: ReactNode;
    /** Slot rendered at the far-left of the bar, before the document name. */
    leadingSlot?: ReactNode;
    /** Toggle the left rail's collapsed state. Omit to hide the toggle. */
    onToggleLeftRail?: () => void;
    /** Whether the left rail is currently collapsed (drives the toggle label). */
    leftRailCollapsed?: boolean;
    /** Toggle the inspector's collapsed state. Omit to hide the toggle. */
    onToggleInspector?: () => void;
    /** Whether the inspector is currently collapsed. */
    inspectorCollapsed?: boolean;
}

/**
 * Editor top bar — h-12 strip with three clusters:
 *
 * - **left**: a menu glyph, the document name, and the page-size / orientation
 *   selects (composed from the granular header primitives, not the bundled
 *   `Editor.Properties`).
 * - **center**: the estimated file-size badge.
 * - **right**: undo/redo, then preview/print/download, then the host theme
 *   toggle, grouped with subtle dividers.
 *
 * Every control reads from the editor context, so the bar takes no state
 * props beyond the injected `themeToggle` slot.
 */
export function TopBar({
    themeToggle,
    leadingSlot,
    onToggleLeftRail,
    leftRailCollapsed,
    onToggleInspector,
    inspectorCollapsed,
}: TopBarProps) {
    return (
        <div className="flex h-12 items-center justify-between border-b border-border bg-card px-3">
            <div className="flex min-w-0 items-center gap-1">
                {leadingSlot ? (
                    <>
                        {leadingSlot}
                        <Divider />
                    </>
                ) : null}
                {onToggleLeftRail ? (
                    <button
                        type="button"
                        onClick={onToggleLeftRail}
                        aria-label={leftRailCollapsed ? 'Show left sidebar' : 'Hide left sidebar'}
                        title={leftRailCollapsed ? 'Show left sidebar' : 'Hide left sidebar'}
                        className={cn(
                            ACTION_BUTTON_CLASS,
                            'inline-flex items-center justify-center',
                        )}
                    >
                        <PanelLeft className="h-4 w-4" />
                    </button>
                ) : null}
                <div className="flex min-w-0 items-center">
                    <DocumentName asTitle />
                    <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <Divider />
                <PageSizeSelect />
                <OrientationSelect />
            </div>

            <div className="hidden items-center gap-3 md:flex">
                <FileSizeBadge />
            </div>

            {/* Right cluster — a tight row of subtle monochrome icon buttons,
                matching Figma's top-right: undo / redo · preview / print /
                download · theme toggle. No colored fills, no text labels. */}
            <div
                className={cn(
                    'flex items-center gap-0.5',
                    '[&_button]:h-8 [&_button]:w-8 [&_button]:rounded-md',
                    '[&_button]:text-muted-foreground [&_button:hover]:bg-accent [&_button:hover]:text-foreground',
                )}
            >
                <UndoButton variant="ghost" className={ACTION_BUTTON_CLASS} />
                <RedoButton variant="ghost" className={ACTION_BUTTON_CLASS} />
                <Divider />
                <PreviewButton iconOnly variant="ghost" className={ACTION_BUTTON_CLASS} />
                <PrintButton iconOnly variant="ghost" className={ACTION_BUTTON_CLASS} />
                <DownloadButton iconOnly variant="ghost" className={ACTION_BUTTON_CLASS} />
                {onToggleInspector ? (
                    <>
                        <Divider />
                        <button
                            type="button"
                            onClick={onToggleInspector}
                            aria-label={
                                inspectorCollapsed ? 'Show right sidebar' : 'Hide right sidebar'
                            }
                            title={inspectorCollapsed ? 'Show right sidebar' : 'Hide right sidebar'}
                            className={cn(
                                ACTION_BUTTON_CLASS,
                                'inline-flex items-center justify-center',
                            )}
                        >
                            <PanelRight className="h-4 w-4" />
                        </button>
                    </>
                ) : null}
                {themeToggle ? (
                    <>
                        <Divider />
                        {themeToggle}
                    </>
                ) : null}
            </div>
        </div>
    );
}
