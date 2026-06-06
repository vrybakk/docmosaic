'use client';

import { Eye } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Open-preview action button. Fires the `preview` analytics event and
 * flips the editor's `isPreviewOpen` flag through context.
 */
export function PreviewButton() {
    const { state, ui } = useEditor();
    const hasContent = state.sections.length > 0;

    const handleClick = () => {
        trackEvent.preview();
        ui.openPreview();
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
