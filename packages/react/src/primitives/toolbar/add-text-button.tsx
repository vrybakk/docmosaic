'use client';

import { Type as TypeIcon } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface AddTextButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button. */
    className?: string;
}

/**
 * Adds a new text section to the current page. Calls
 * `actions.addSection({ type: 'text' })` from context — which selects the
 * newly-created section and fires the analytics event.
 */
export function AddTextButton({
    iconOnly = false,
    variant = 'caramel',
    className,
}: AddTextButtonProps = {}) {
    const { actions, readOnly } = useEditor();

    if (readOnly) return null;

    if (iconOnly) {
        return (
            <Button
                variant={variant}
                size="icon"
                aria-label="Add Text"
                title="Add Text"
                onClick={() => {
                    actions.addSection({ type: 'text' });
                }}
                className={cn('h-9 w-full', 'add-text-button-click-trigger', className)}
            >
                <TypeIcon className="h-4 w-4" />
                <span className="sr-only">Add Text</span>
            </Button>
        );
    }

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
