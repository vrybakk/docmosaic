'use client';

import { Redo } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface RedoButtonProps {
    /** Override the button variant. Defaults to `'white'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the button. */
    className?: string;
}

/**
 * Redo action button. Reads `canRedo` and the `redo` action from the
 * editor context.
 *
 * Hidden in read-only mode — there is nothing to redo when mutations are
 * suppressed.
 */
export function RedoButton({ variant = 'white', className }: RedoButtonProps = {}) {
    const { canRedo, actions, readOnly } = useEditor();

    if (readOnly) return null;

    return (
        <Button
            variant={variant}
            size="icon"
            aria-label="Redo"
            title="Redo"
            onClick={actions.redo}
            disabled={!canRedo}
            className={cn('disabled:opacity-50', 'h-10 w-10', className)}
        >
            <Redo className="h-4 w-4" />
            <span className="sr-only">Redo</span>
        </Button>
    );
}
