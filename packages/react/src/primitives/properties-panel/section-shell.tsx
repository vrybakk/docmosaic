'use client';

import { type ReactNode } from 'react';
import { cn } from '../../internal/utils';

interface SectionShellProps {
    title: string;
    children: ReactNode;
    className?: string;
}

/**
 * Internal layout helper for {@link PropertiesPanel} sub-sections. Renders a
 * small uppercase header and a vertical stack of fields beneath, separated
 * from sibling sections by a top border.
 *
 * Not exported from the package — sub-sections (Layout, Layer, Text, Shape)
 * compose this directly so they all share the same visual rhythm.
 */
export function SectionShell({ title, children, className }: SectionShellProps) {
    return (
        <div className={cn('border-t border-primary/10 first:border-t-0 px-3 py-3', className)}>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                {title}
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

interface FieldLabelProps {
    children: ReactNode;
    htmlFor?: string;
    className?: string;
}

/**
 * Compact label used by `PropertiesPanel` field rows. Small + neutral so
 * consecutive labeled rows read as a tight column.
 */
export function FieldLabel({ children, htmlFor, className }: FieldLabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={cn(
                'block text-[10px] font-medium uppercase tracking-wide text-foreground/50',
                className,
            )}
        >
            {children}
        </label>
    );
}
