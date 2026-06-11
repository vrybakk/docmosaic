'use client';

import { cn } from '../../internal/utils';

interface EmptyStateProps {
    className?: string;
}

/**
 * Minimal centered hint rendered by {@link PropertiesPanel} when nothing is
 * selected. Consumers can replace it by passing custom children to
 * `Editor.PropertiesPanel` — the panel only falls back to the default empty
 * state for its bundled "no children + empty selection" path.
 */
export function EmptyState({ className }: EmptyStateProps = {}) {
    return (
        <div
            className={cn(
                'flex flex-1 items-center justify-center px-4 py-8 text-center',
                'text-xs text-foreground/60',
                className,
            )}
            data-properties-empty-state="true"
        >
            Select a section to edit its properties
        </div>
    );
}
