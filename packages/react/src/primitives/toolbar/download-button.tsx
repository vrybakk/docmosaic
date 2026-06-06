'use client';

import { Download } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Download action button. Fires the `download` analytics event (toolbar
 * source) and triggers `pdfApi.download` from the editor context.
 */
export function DownloadButton() {
    const { state, pdfApi } = useEditor();
    const hasContent = state.sections.length > 0;

    const handleClick = () => {
        trackEvent.download(false);
        void pdfApi.download();
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
