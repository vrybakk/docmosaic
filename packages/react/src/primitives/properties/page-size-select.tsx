'use client';

import { PAGE_SIZE_LABELS } from '@docmosaic/core';
import { useEditor } from '../../context/editor';
import { PAGE_SIZE_OPTIONS } from '../../internal/options';
import { cn } from '../../internal/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface PageSizeSelectProps {
    /** When true, expands the trigger to fill its container (mobile sheet). */
    fullWidth?: boolean;
}

/**
 * Page-size dropdown with grouped section titles (ISO / North American).
 * Reads `state.pageSize` and dispatches through `actions.updatePageSize`.
 */
export function PageSizeSelect({ fullWidth = false }: PageSizeSelectProps = {}) {
    const { state, actions, readOnly } = useEditor();

    return (
        <Select value={state.pageSize} onValueChange={actions.updatePageSize} disabled={readOnly}>
            <SelectTrigger
                aria-label="Page size"
                className={
                    fullWidth
                        ? 'w-full'
                        : cn(
                              'h-8 w-fit gap-1 border-input px-2.5',
                              'text-foreground bg-transparent',
                              'focus:ring-ring',
                          )
                }
            >
                {fullWidth ? (
                    <SelectValue placeholder="Select page size" />
                ) : (
                    // Compact trigger: show just the short code (e.g. "A4"),
                    // not the full "A4 (210×297mm)" label that lives in the menu.
                    <span className="text-sm">{state.pageSize}</span>
                )}
            </SelectTrigger>
            <SelectContent>
                {PAGE_SIZE_OPTIONS.map((item, index) =>
                    item.type === 'title' ? (
                        <div
                            key={index}
                            className={cn(
                                'px-2 py-1.5 text-sm font-bold uppercase text-muted-foreground',
                                index !== 0 && 'border-t',
                            )}
                        >
                            {item.label}
                        </div>
                    ) : (
                        <SelectItem key={item.value} value={item.value}>
                            {PAGE_SIZE_LABELS[item.value]}
                        </SelectItem>
                    ),
                )}
            </SelectContent>
        </Select>
    );
}
