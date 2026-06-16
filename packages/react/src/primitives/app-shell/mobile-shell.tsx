'use client';

import { Files, Layers, Settings2, SlidersHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Sheet, SheetContent } from '../../ui/sheet';
import { Canvas } from '../canvas';
import { ContextMenu } from '../context-menu';
import { KeybindingHelp } from '../keybinding-help';
import { LayerList } from '../layer-list';
import { Pages } from '../pages';
import { Preview } from '../preview';
import { DocumentName } from '../properties/document-name';
import { OrientationSelect } from '../properties/orientation-select';
import { PageSizeSelect } from '../properties/page-size-select';
import { PropertiesPanel } from '../properties-panel';
import { Section } from '../section';
import { Toaster } from '../toaster';
import { AddImageButton } from '../toolbar/add-image-button';
import { AddTextButton } from '../toolbar/add-text-button';
import { DownloadButton } from '../toolbar/download-button';
import { DrawButton } from '../toolbar/draw-button';
import { PreviewButton } from '../toolbar/preview-button';
import { PrintButton } from '../toolbar/print-button';
import { RedoButton } from '../toolbar/redo-button';
import { SelectToolButton } from '../toolbar/select-tool-button';
import { ShapeToolButton } from '../toolbar/shape-tool-button';
import { UndoButton } from '../toolbar/undo-button';
import { Zoom } from '../zoom';
import type { EditorShellProps } from './index';

/** Finger-friendly tool button — 40px, ghost at rest, accent-filled when armed. */
const TOOL =
    'h-10 w-10 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground';
const TOOL_ACTIVE =
    'h-10 w-10 shrink-0 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground';
/** Subtle monochrome icon button shared by the compact top-bar actions. */
const ACTION = 'h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground';

type MobileSheet = 'pages' | 'layers' | 'properties' | 'document';

/**
 * Compact mobile top bar — the desktop {@link TopBar} can't fit the document
 * name, page-size / orientation selects, and the full action cluster in a
 * phone-width row (they overlap). Here the bar keeps only the document name and
 * the most-used actions (undo / redo · download · theme); page size,
 * orientation, preview, and print move into the "Doc" sheet below.
 */
function MobileTopBar({
    themeToggle,
    leadingSlot,
}: {
    themeToggle?: ReactNode;
    leadingSlot?: ReactNode;
}) {
    return (
        <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-card px-2">
            <div className="flex min-w-0 flex-1 items-center gap-1">
                {leadingSlot}
                <DocumentName asTitle />
            </div>
            <div
                className={cn(
                    'flex shrink-0 items-center gap-0.5',
                    '[&_button]:h-8 [&_button]:w-8 [&_button]:rounded-md',
                    '[&_button]:text-muted-foreground [&_button:hover]:bg-accent [&_button:hover]:text-foreground',
                )}
            >
                <UndoButton variant="ghost" className={ACTION} />
                <RedoButton variant="ghost" className={ACTION} />
                <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
                <DownloadButton iconOnly variant="ghost" className={ACTION} />
                {themeToggle ? (
                    <>
                        <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
                        {themeToggle}
                    </>
                ) : null}
            </div>
        </div>
    );
}

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
            className="flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

/** Page size · orientation · preview · print — the document settings that the
 *  compact top bar hands off to a slide-up sheet on mobile. */
function DocumentSheet() {
    return (
        <div className="space-y-4 p-4">
            <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Page size</span>
                <PageSizeSelect fullWidth />
            </div>
            <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Orientation</span>
                <OrientationSelect fullWidth />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
                <PreviewButton />
                <PrintButton />
            </div>
        </div>
    );
}

/**
 * Phone/tablet layout for the editor shell: a full-bleed canvas with a compact
 * top bar, a scrollable tool strip, and the Pages / Layers / Edit / Doc panels
 * surfaced as slide-up bottom sheets. Rendered by {@link EditorShell} below the
 * desktop breakpoint.
 */
export function MobileEditorShell({
    themeToggle,
    leadingSlot,
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
            <MobileTopBar themeToggle={themeToggle} leadingSlot={leadingSlot} />

            <div className="relative min-h-0 flex-1 bg-muted">
                <ContextMenu className="flex h-full min-h-0">
                    <Canvas showControls={false}>
                        <Section />
                        <Zoom />
                    </Canvas>
                </ContextMenu>
            </div>

            <div className="shrink-0 border-t border-border bg-card">
                {/* Tool strip: all creation tools in one horizontally-scrollable
                    row with a right-edge fade hinting there's more to swipe. */}
                {palette ? (
                    <div className="relative">
                        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                            <DrawButton
                                iconOnly
                                variant="ghost"
                                activeVariant="secondary"
                                className={TOOL}
                                activeClassName={TOOL_ACTIVE}
                            />
                        </div>
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent"
                        />
                    </div>
                ) : null}

                {/* Panel nav: four evenly-spaced sheet triggers. */}
                <div
                    className={cn(
                        'flex items-stretch gap-1 px-2 py-1',
                        palette && 'border-t border-border',
                    )}
                >
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
                    <PanelButton
                        label="Doc"
                        icon={<Settings2 className="h-5 w-5" />}
                        onClick={() => setSheet('document')}
                    />
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
                    {sheet === 'document' && <DocumentSheet />}
                </SheetContent>
            </Sheet>

            <Toaster />
            <KeybindingHelp />
            <Preview />
            {children}
        </div>
    );
}
