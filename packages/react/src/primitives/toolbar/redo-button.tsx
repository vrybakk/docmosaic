'use client';

import { Redo } from 'lucide-react';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface RedoButtonProps {
    canRedo: boolean;
    onRedo: () => void;
}

/**
 * Redo action button. Pure presentation — caller wires redo state and
 * analytics in `onRedo`.
 */
export function RedoButton({ canRedo, onRedo }: RedoButtonProps) {
    return (
        <Button
            variant="white"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className={cn('disabled:opacity-50', 'h-10 w-10')}
        >
            <Redo className="h-5 w-5" />
            <span className="sr-only">Redo</span>
        </Button>
    );
}
