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
                className={
                    fullWidth
                        ? 'w-full'
                        : cn(
                              'w-[120px] border-primary/20',
                              'text-primary bg-white',
                              'focus:ring-secondary/20',
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
