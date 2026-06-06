'use client';

import { Printer } from 'lucide-react';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface PrintButtonProps {
    hasContent: boolean;
    onPrint: () => void;
}

/**
 * Print action button. Fires the `print` analytics event (toolbar source)
 * before delegating to `onPrint`.
 */
export function PrintButton({ hasContent, onPrint }: PrintButtonProps) {
    const handleClick = () => {
        trackEvent.print(false);
        onPrint();
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
