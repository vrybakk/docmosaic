'use client';

import { PAGE_SIZE_LABELS, type PageSize } from '@docmosaic/core';
import { PAGE_SIZE_OPTIONS } from '../../internal/options';
import { cn } from '../../internal/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';

interface PageSizeSelectProps {
    value: PageSize;
    onValueChange: (value: PageSize) => void;
    /** When true, expands the trigger to fill its container (mobile sheet). */
    fullWidth?: boolean;
}

/**
 * Page-size dropdown with grouped section titles (ISO / North American).
 */
export function PageSizeSelect({ value, onValueChange, fullWidth = false }: PageSizeSelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={
                    fullWidth
                        ? 'w-full'
                        : cn(
                              'min-w-[120px] w-fit border-editor-accent-soft/20',
                              'text-editor-accent bg-white',
                              'focus:ring-editor-accent/20',
                          )
                }
            >
                <SelectValue placeholder={fullWidth ? 'Select page size' : 'Page Size'} />
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
