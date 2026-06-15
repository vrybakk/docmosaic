'use client';

import { useEditor } from '../../context/editor';
import { ORIENTATION_OPTIONS } from '../../internal/options';
import { cn } from '../../internal/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface OrientationSelectProps {
    /** When true, expands the trigger to fill its container (mobile sheet). */
    fullWidth?: boolean;
}

/**
 * Page orientation dropdown (portrait / landscape). Reads
 * `state.orientation` and dispatches through `actions.updateOrientation`.
 */
export function OrientationSelect({ fullWidth = false }: OrientationSelectProps = {}) {
    const { state, actions, readOnly } = useEditor();

    return (
        <Select
            value={state.orientation}
            onValueChange={actions.updateOrientation}
            disabled={readOnly}
        >
            <SelectTrigger
                aria-label="Orientation"
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
                    <SelectValue placeholder="Select orientation" />
                ) : (
                    <span className="text-sm capitalize">{state.orientation}</span>
                )}
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
