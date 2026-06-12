'use client';

import { SlidersHorizontal } from 'lucide-react';
import { PropertiesPanel } from '../properties-panel';

/**
 * Right inspector panel of the editor shell. A small "Properties" header over
 * the contextual `Editor.PropertiesPanel`, which reflects the current
 * selection and reads everything from the editor context.
 */
export function Inspector() {
    return (
        <div className="flex h-full min-h-0 flex-col border-l border-border bg-card">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
                <SlidersHorizontal aria-hidden className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Properties</span>
            </div>
            <PropertiesPanel className="min-h-0 flex-1 max-w-none border-0 bg-transparent" />
        </div>
    );
}
