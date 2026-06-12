'use client';

import { Undo } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface UndoButtonProps {
    /** Override the button variant. Defaults to `'white'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the button. */
    className?: string;
}

/**
 * Undo action button. Reads `canUndo` and the `undo` action from the
 * editor context.
 *
 * Hidden in read-only mode — there is nothing to undo when mutations are
 * suppressed.
 */
export function UndoButton({ variant = 'white', className }: UndoButtonProps = {}) {
    const { canUndo, actions, readOnly } = useEditor();

    if (readOnly) return null;

    return (
        <Button
            variant={variant}
            size="icon"
            aria-label="Undo"
            title="Undo"
            onClick={actions.undo}
            disabled={!canUndo}
            className={cn('disabled:opacity-50', 'h-10 w-10', className)}
        >
            <Undo className="h-4 w-4" />
            <span className="sr-only">Undo</span>
        </Button>
    );
}
