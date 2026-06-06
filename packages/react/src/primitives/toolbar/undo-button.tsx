'use client';

import { Undo } from 'lucide-react';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface UndoButtonProps {
    canUndo: boolean;
    onUndo: () => void;
}

/**
 * Undo action button. Pure presentation — caller wires undo state and
 * analytics in `onUndo`.
 */
export function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
    return (
        <Button
            variant="white"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className={cn('disabled:opacity-50', 'h-10 w-10')}
        >
            <Undo className="h-5 w-5" />
            <span className="sr-only">Undo</span>
        </Button>
    );
}
