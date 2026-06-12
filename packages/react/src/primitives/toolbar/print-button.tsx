'use client';

import { Printer } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface PrintButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'cream'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button. */
    className?: string;
}

/**
 * Print action button. Fires the `print` analytics event (toolbar source)
 * and triggers `pdfApi.print` from the editor context.
 */
export function PrintButton({
    iconOnly = false,
    variant = 'cream',
    className,
}: PrintButtonProps = {}) {
    const { state, pdfApi } = useEditor();
    const hasContent = state.sections.length > 0;

    const handleClick = () => {
        trackEvent.print(false);
        void pdfApi.print();
    };

    if (iconOnly) {
        return (
            <Button
                variant={variant}
                size="icon"
                aria-label="Print"
                title="Print"
                onClick={handleClick}
                disabled={!hasContent}
                className={cn('disabled:opacity-50', 'print-button-click-trigger', className)}
            >
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print</span>
            </Button>
        );
    }

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
