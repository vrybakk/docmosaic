'use client';

import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp } from 'lucide-react';
import { useMemo } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { SectionShell } from './section-shell';

interface LayerSectionProps {
    className?: string;
}

/**
 * Layer sub-section of {@link PropertiesPanel}. Surfaces the four reorder
 * actions (`bringToFront`, `moveForward`, `moveBackward`, `sendToBack`) for
 * the currently selected section.
 *
 * Hidden entirely when the selection is empty or multi-section — z-index is a
 * single-section concern; multi-select callers should adjust order one at a
 * time.
 */
export function LayerSection({ className }: LayerSectionProps = {}) {
    const { state, ui, actions } = useEditor();
    const selectedIds = ui.selectedSectionIds;

    const section = useMemo(() => {
        if (selectedIds.size !== 1) return null;
        const id = ui.selectedSectionId;
        if (!id) return null;
        return state.sections.find((s) => s.id === id) ?? null;
    }, [state.sections, selectedIds, ui.selectedSectionId]);

    if (!section) return null;

    // Show the section's current position within its page so the user has a
    // sense of where on the stack they are operating. 1-indexed because the
    // surrounding UI tends to count "Layer 1" rather than "Layer 0".
    const peers = state.sections
        .filter((s) => s.page === section.page)
        .sort((a, b) => a.zIndex - b.zIndex);
    const positionFromBack = peers.findIndex((s) => s.id === section.id);
    const layerLabel =
        positionFromBack >= 0 ? `Layer ${positionFromBack + 1} of ${peers.length}` : '';

    return (
        <SectionShell title="Layer" className={className}>
            <div className="text-[11px] text-editor-text/70">{layerLabel}</div>
            <div className="grid grid-cols-4 gap-1">
                <LayerButton
                    label="Bring to front"
                    onClick={() => actions.bringToFront(section.id)}
                    icon={<ChevronsUp className="h-3.5 w-3.5" />}
                />
                <LayerButton
                    label="Move up"
                    onClick={() => actions.moveForward(section.id)}
                    icon={<ArrowUp className="h-3.5 w-3.5" />}
                />
                <LayerButton
                    label="Move down"
                    onClick={() => actions.moveBackward(section.id)}
                    icon={<ArrowDown className="h-3.5 w-3.5" />}
                />
                <LayerButton
                    label="Send to back"
                    onClick={() => actions.sendToBack(section.id)}
                    icon={<ChevronsDown className="h-3.5 w-3.5" />}
                />
            </div>
        </SectionShell>
    );
}

interface LayerButtonProps {
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    className?: string;
}

function LayerButton({ label, onClick, icon, className }: LayerButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cn(
                'h-7 inline-flex items-center justify-center rounded-md',
                'border border-editor-accent/15 bg-editor-surface text-editor-text',
                'hover:bg-editor-accent-soft hover:text-editor-text',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent',
                className,
            )}
        >
            {icon}
        </button>
    );
}
