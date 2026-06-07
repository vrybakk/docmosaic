'use client';

import { Redo } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Redo action button. Reads `canRedo` and the `redo` action from the
 * editor context — no props.
 *
 * Hidden in read-only mode — there is nothing to redo when mutations are
 * suppressed.
 */
export function RedoButton() {
    const { canRedo, actions, readOnly } = useEditor();

    if (readOnly) return null;

    return (
        <Button
            variant="white"
            size="icon"
            onClick={actions.redo}
            disabled={!canRedo}
            className={cn('disabled:opacity-50', 'h-10 w-10')}
        >
            <Redo className="h-5 w-5" />
            <span className="sr-only">Redo</span>
        </Button>
    );
}
