'use client';

import { Eye } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface PreviewButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'white'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button. */
    className?: string;
}

/**
 * Open-preview action button. Fires the `preview` analytics event and
 * flips the editor's `isPreviewOpen` flag through context.
 */
export function PreviewButton({
    iconOnly = false,
    variant = 'white',
    className,
}: PreviewButtonProps = {}) {
    const { state, ui } = useEditor();
    const hasContent = state.sections.length > 0;

    const handleClick = () => {
        trackEvent.preview();
        ui.openPreview();
    };

    if (iconOnly) {
        return (
            <Button
                variant={variant}
                size="icon"
                aria-label="Preview"
                title="Preview"
                onClick={handleClick}
                disabled={!hasContent}
                className={cn('disabled:opacity-50', 'preview-button-click-trigger', className)}
            >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Preview</span>
            </Button>
        );
    }

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
