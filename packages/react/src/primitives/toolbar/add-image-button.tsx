'use client';

import { Image as ImageIcon } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface AddImageButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button. */
    className?: string;
}

/**
 * Adds a new image section to the current page. Calls `actions.addSection`
 * from context — which selects the newly-created section and fires the
 * analytics event.
 */
export function AddImageButton({
    iconOnly = false,
    variant = 'caramel',
    className,
}: AddImageButtonProps = {}) {
    const { actions, readOnly } = useEditor();

    if (readOnly) return null;

    if (iconOnly) {
        return (
            <Button
                variant={variant}
                size="icon"
                aria-label="Add Image"
                title="Add Image"
                onClick={() => {
                    actions.addSection();
                }}
                className={cn('h-9 w-full', 'add-image-button-click-trigger', className)}
            >
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Add Image</span>
            </Button>
        );
    }

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
