'use client';

import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../../internal/utils';

interface CollapsibleSectionProps {
    /** Small uppercase muted label shown in the section header. */
    label: string;
    /** Section body, revealed while expanded. */
    children: ReactNode;
    /** Start expanded. Defaults to `true`. */
    defaultOpen?: boolean;
    /** Extra classes for the body wrapper. */
    bodyClassName?: string;
}

/**
 * Collapsible left-rail section with a small uppercase muted label and a
 * chevron toggle — the "Pages" / "Layers" groupings in the shell rail.
 */
export function CollapsibleSection({
    label,
    children,
    defaultOpen = true,
    bodyClassName,
}: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="flex min-h-0 flex-col">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center justify-between px-3 py-2',
                    'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
                    'transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                )}
            >
                {label}
                <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform', !open && '-rotate-90')}
                />
            </button>
            {open ? <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div> : null}
        </div>
    );
}
