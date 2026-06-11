'use client';

import type { Section } from '@docmosaic/core';
import { useCallback, useMemo } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { ScrollArea } from '../../ui/scroll-area';
import { LayerRow } from './layer-row';

export interface LayerListProps {
    className?: string;
    /**
     * Optional title rendered above the list. Pass an empty string to omit
     * the header entirely (useful when the surrounding shell already labels
     * the panel).
     */
    title?: string;
}

/**
 * Compute the next sections array when row at `fromIndex` is moved to
 * `toIndex` in the visible (z-desc) layer order. The reorder is expressed
 * as a contiguous z-index reassignment — every section on the current page
 * gets a fresh integer, descending in the new visible order. Sections on
 * other pages are returned unchanged.
 *
 * @remarks
 * Returning a flat assignment instead of swap-by-swap (à la
 * `moveForward`/`moveBackward`) keeps drag-reorder atomic: one
 * `updateSection` per moved peer, no in-flight half-swapped state.
 */
function reorderVisible(
    sections: Section[],
    pageNumber: number,
    fromIndex: number,
    toIndex: number,
): Section[] {
    const pageIds = new Map<string, number>();
    // Build the current visible-order list (z-desc, tie-break by array index
    // to mirror the canvas/PDF sort).
    const pageSections = sections
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => s.page === pageNumber)
        .sort((a, b) => b.s.zIndex - a.s.zIndex || a.idx - b.idx)
        .map(({ s }) => s);
    if (
        fromIndex < 0 ||
        fromIndex >= pageSections.length ||
        toIndex < 0 ||
        toIndex >= pageSections.length ||
        fromIndex === toIndex
    ) {
        return sections;
    }
    const reordered = [...pageSections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    // Assign descending integers — first item in the visible list gets the
    // highest zIndex so it renders on top.
    const maxZ = reordered.length - 1;
    reordered.forEach((s, i) => {
        pageIds.set(s.id, maxZ - i);
    });
    return sections.map((s) => (pageIds.has(s.id) ? { ...s, zIndex: pageIds.get(s.id)! } : s));
}

/**
 * Figma/Photoshop-style outliner that lists every section on the current
 * page in render order (top of stack first). Click a row to select the
 * section, shift/meta-click to toggle it in/out of multi-selection, drag a
 * row's grip handle to reorder, and use the per-row buttons to hide or lock
 * the section.
 *
 * Reads sections + current page from {@link useEditor} so callers don't
 * need to wire anything: drop the primitive anywhere underneath
 * `Editor.Root` and it lights up.
 *
 * @example Right-rail sibling to PropertiesPanel
 * ```tsx
 * <Editor.Root>
 *   <Editor.Properties />
 *   <Editor.Toolbar />
 *   <Editor.Pages />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <div className="flex flex-col border-l">
 *     <Editor.LayerList className="border-b" />
 *     <Editor.PropertiesPanel />
 *   </div>
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 */
export function LayerList({ className, title = 'Layers' }: LayerListProps = {}) {
    const { state, ui, actions, readOnly } = useEditor();
    const { sections, currentPage } = state;

    // Visible list — z-desc with array-index tiebreak so the row order
    // mirrors what the canvas paints from top to bottom.
    const visibleSections = useMemo(() => {
        return sections
            .map((s, idx) => ({ s, idx }))
            .filter(({ s }) => s.page === currentPage)
            .sort((a, b) => b.s.zIndex - a.s.zIndex || a.idx - b.idx)
            .map(({ s }) => s);
    }, [sections, currentPage]);

    const handleSelect = useCallback(
        (sectionId: string, e: React.MouseEvent) => {
            if (e.shiftKey || e.metaKey || e.ctrlKey) {
                ui.toggleSelection(sectionId);
                return;
            }
            ui.setSelectedSectionId(sectionId);
        },
        [ui],
    );

    const handleMoveRow = useCallback(
        (fromIndex: number, toIndex: number) => {
            if (readOnly) return;
            const next = reorderVisible(sections, currentPage, fromIndex, toIndex);
            // Dispatch one updateSection per changed peer. Keeping
            // identity-equal sections out of the dispatch avoids redundant
            // re-renders and history-timeline pollution.
            for (let i = 0; i < sections.length; i++) {
                if (next[i] !== sections[i]) {
                    actions.updateSection(next[i]);
                }
            }
        },
        [sections, currentPage, readOnly, actions],
    );

    return (
        <aside
            data-layer-list="true"
            aria-label="Layers"
            className={cn(
                'flex flex-col min-h-0 bg-background text-foreground',
                'border-primary/10',
                className,
            )}
        >
            {title ? (
                <div className="px-3 pt-3 pb-2 border-b border-primary/10">
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                        {title}
                    </h2>
                </div>
            ) : null}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {visibleSections.length === 0 ? (
                        <div
                            data-layer-list-empty="true"
                            className="px-2 py-6 text-center text-xs text-foreground/50"
                        >
                            No layers on this page.
                        </div>
                    ) : (
                        visibleSections.map((section, i) => (
                            <LayerRow
                                key={section.id}
                                section={section}
                                index={i}
                                isSelected={ui.selectedSectionIds.has(section.id)}
                                readOnly={readOnly}
                                onSelect={(e) => handleSelect(section.id, e)}
                                onToggleHidden={() => actions.toggleHidden(section.id)}
                                onToggleLocked={() => actions.toggleLocked(section.id)}
                                onMoveRow={handleMoveRow}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
}

LayerList.Row = LayerRow;
