'use client';

import { Eye } from 'lucide-react';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface PreviewButtonProps {
    hasContent: boolean;
    onPreview: () => void;
}

/**
 * Open-preview action button. Fires the `preview` analytics event before
 * delegating to `onPreview`.
 */
export function PreviewButton({ hasContent, onPreview }: PreviewButtonProps) {
    const handleClick = () => {
        trackEvent.preview();
        onPreview();
    };

    return (
        <Button
            variant="white"
            onClick={handleClick}
            disabled={!hasContent}
            className={cn('disabled:opacity-50', 'w-full', 'preview-button-click-trigger')}
            icon={<Eye className="h-4 w-4" />}
        >
            Preview
        </Button>
    );
}
