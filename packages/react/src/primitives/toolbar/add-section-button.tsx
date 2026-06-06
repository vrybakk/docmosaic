'use client';

import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface AddSectionButtonProps {
    onAddSection: () => void;
}

/**
 * Adds a new image section to the current page. Caller wires the
 * `addSection` action and any analytics tracking.
 */
export function AddSectionButton({ onAddSection }: AddSectionButtonProps) {
    return (
        <Button
            variant="caramel"
            onClick={onAddSection}
            className={cn('w-full', 'add-image-button-click-trigger')}
            icon={<ImageIcon className="h-4 w-4" />}
        >
            Add Image
        </Button>
    );
}
