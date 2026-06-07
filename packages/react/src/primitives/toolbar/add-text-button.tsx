'use client';

import { Type as TypeIcon } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Adds a new text section to the current page. Calls
 * `actions.addSection({ type: 'text' })` from context — which selects the
 * newly-created section and fires the analytics event.
 */
export function AddTextButton() {
    const { actions } = useEditor();

    return (
        <Button
            variant="caramel"
            onClick={() => {
                actions.addSection({ type: 'text' });
            }}
            className={cn('w-full', 'add-text-button-click-trigger')}
            icon={<TypeIcon className="h-4 w-4" />}
        >
            Add Text
        </Button>
    );
}
