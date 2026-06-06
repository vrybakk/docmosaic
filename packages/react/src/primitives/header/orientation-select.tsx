'use client';

import type { PageOrientation } from '@docmosaic/core';
import { ORIENTATION_OPTIONS } from '../../internal/options';
import { cn } from '../../internal/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';

interface OrientationSelectProps {
    value: PageOrientation;
    onValueChange: (value: PageOrientation) => void;
    /** When true, expands the trigger to fill its container (mobile sheet). */
    fullWidth?: boolean;
}

/**
 * Page orientation dropdown (portrait / landscape).
 */
export function OrientationSelect({
    value,
    onValueChange,
    fullWidth = false,
}: OrientationSelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={
                    fullWidth
                        ? 'w-full'
                        : cn(
                              'w-[120px] border-editor-accent/20',
                              'text-editor-accent bg-white',
                              'focus:ring-editor-accent-soft/20',
                          )
                }
            >
                <SelectValue placeholder={fullWidth ? 'Select orientation' : 'Orientation'} />
            </SelectTrigger>
            <SelectContent>
                {ORIENTATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
