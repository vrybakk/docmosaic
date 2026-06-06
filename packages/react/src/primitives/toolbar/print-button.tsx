'use client';

import { Printer } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Print action button. Fires the `print` analytics event (toolbar source)
 * and triggers `pdfApi.print` from the editor context.
 */
export function PrintButton() {
    const { state, pdfApi } = useEditor();
    const hasContent = state.sections.length > 0;

    const handleClick = () => {
        trackEvent.print(false);
        void pdfApi.print();
    };

    return (
        <Button
            variant="cream"
            onClick={handleClick}
            disabled={!hasContent}
            className={cn('disabled:opacity-50', 'w-full', 'print-button-click-trigger')}
            icon={<Printer className="h-4 w-4" />}
        >
            Print
        </Button>
    );
}
