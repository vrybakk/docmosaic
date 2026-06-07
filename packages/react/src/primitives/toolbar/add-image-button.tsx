'use client';

import { Image as ImageIcon } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Adds a new image section to the current page. Calls `actions.addSection`
 * from context — which selects the newly-created section and fires the
 * analytics event.
 */
export function AddImageButton() {
    const { actions, readOnly } = useEditor();

    if (readOnly) return null;

    return (
        <Button
            variant="caramel"
            onClick={() => {
                actions.addSection();
            }}
            className={cn('w-full', 'add-image-button-click-trigger')}
            icon={<ImageIcon className="h-4 w-4" />}
        >
            Add Image
        </Button>
    );
}
