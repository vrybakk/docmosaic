'use client';

import { Undo } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Undo action button. Reads `canUndo` and the `undo` action from the
 * editor context — no props.
 */
export function UndoButton() {
    const { canUndo, actions } = useEditor();

    return (
        <Button
            variant="white"
            size="icon"
            onClick={actions.undo}
            disabled={!canUndo}
            className={cn('disabled:opacity-50', 'h-10 w-10')}
        >
            <Undo className="h-5 w-5" />
            <span className="sr-only">Undo</span>
        </Button>
    );
}
