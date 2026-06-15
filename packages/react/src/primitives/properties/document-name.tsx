'use client';

import { Pen } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Input } from '../../ui/input';

interface DocumentNameProps {
    /**
     * Hide the trailing pencil affordance and tighten the input so the name
     * reads as a plain title. Used by the app-shell top bar, where the name
     * sits between a menu glyph and a chevron rather than in a labeled field.
     * Defaults to `false`.
     */
    asTitle?: boolean;
    /** Extra classes merged onto the input. */
    className?: string;
}

/**
 * Inline document name input. Reads the current name and dispatches
 * renames through `actions.updateName` on the editor context.
 */
export function DocumentName({ asTitle = false, className }: DocumentNameProps = {}) {
    const { state, actions, readOnly } = useEditor();

    return (
        <div className="relative min-w-0">
            <Input
                type="text"
                value={state.name}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(e) => actions.updateName(e.target.value)}
                className={cn(
                    'w-full max-w-[300px] bg-transparent border-none',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:ring-0 shadow-none',
                    asTitle
                        ? 'h-8 px-1 text-sm font-medium'
                        : 'text-lg font-semibold pr-5 text-primary placeholder-secondary/50',
                    className,
                )}
                placeholder="Untitled Document"
            />
            {!readOnly && !asTitle && (
                <Pen className="h-4 w-4 text-primary absolute right-2.5 top-0 bottom-0 my-auto" />
            )}
        </div>
    );
}
