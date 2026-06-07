'use client';

import { Pen } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Input } from '../../ui/input';

/**
 * Inline document name input. Reads the current name and dispatches
 * renames through `actions.updateName` on the editor context.
 */
export function DocumentName() {
    const { state, actions } = useEditor();

    return (
        <div className="relative">
            <Input
                type="text"
                value={state.name}
                onChange={(e) => actions.updateName(e.target.value)}
                className={cn(
                    'w-full max-w-[300px] bg-transparent border-none',
                    'text-editor-accent placeholder-editor-accent-soft/50',
                    'text-lg font-semibold focus:ring-0 shadow-none pr-5',
                )}
                placeholder="Untitled Document"
            />
            <Pen className="h-4 w-4 text-editor-accent absolute right-2.5 top-0 bottom-0 my-auto" />
        </div>
    );
}
