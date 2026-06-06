'use client';

import { Download } from 'lucide-react';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface DownloadButtonProps {
    hasContent: boolean;
    onDownload: () => void;
}

/**
 * Download action button. Fires the `download` analytics event (toolbar
 * source) before delegating to `onDownload`.
 */
export function DownloadButton({ hasContent, onDownload }: DownloadButtonProps) {
    const handleClick = () => {
        trackEvent.download(false);
        onDownload();
    };

    return (
        <Button
            variant="sage"
            onClick={handleClick}
            disabled={!hasContent}
            className={cn(
                'min-w-[260px]',
                'disabled:opacity-50',
                'w-full sm:w-auto download-button-click-trigger',
            )}
            icon={<Download className="h-4 w-4" />}
        >
            Download PDF
        </Button>
    );
}
