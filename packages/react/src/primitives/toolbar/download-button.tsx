'use client';

import { ChevronDown, Download, Image as ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface DownloadButtonProps {
    /**
     * Render a compact icon-only pair — a download glyph plus a tiny menu
     * chevron — instead of the wide labeled "Download PDF" split button. Used
     * in the app-shell top bar's monochrome icon cluster.
     */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'sage'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto each icon-only button. */
    className?: string;
}

/**
 * Download action button. Primary click fires the PDF pipeline; the dropdown
 * caret exposes a "Download PNG (per page)" option that routes through
 * `pdfApi.downloadPNGs`.
 *
 * The split is a single-button-plus-menu rather than a true split button so
 * the keyboard story stays simple — Enter on the primary downloads the PDF,
 * the caret opens the menu.
 */
export function DownloadButton({
    iconOnly = false,
    variant = 'sage',
    className,
}: DownloadButtonProps = {}) {
    const { state, pdfApi } = useEditor();
    const hasContent = state.sections.length > 0;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (event: PointerEvent) => {
            if (containerRef.current?.contains(event.target as Node)) return;
            setIsOpen(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen]);

    const handlePdfClick = () => {
        trackEvent.download(false);
        void pdfApi.download();
    };

    const handlePngClick = () => {
        setIsOpen(false);
        // Reuse the same analytics event — the toolbar source is the same; if
        // we ever need to separate the funnels we can split the tracker call.
        trackEvent.download(false);
        void pdfApi.downloadPNGs();
    };

    const menu = isOpen && (
        <div
            role="menu"
            className={cn(
                'absolute right-0 top-full mt-1 z-50 min-w-[240px]',
                'rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1',
            )}
        >
            <button
                type="button"
                role="menuitem"
                onClick={handlePngClick}
                className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-sm',
                    'hover:bg-accent hover:text-accent-foreground disabled:opacity-50',
                )}
            >
                <ImageIcon className="h-4 w-4" />
                Download PNG (per page)
            </button>
        </div>
    );

    if (iconOnly) {
        return (
            <div
                ref={containerRef}
                className="relative inline-flex items-center"
                data-download-menu-root="true"
            >
                <Button
                    variant={variant}
                    size="icon"
                    onClick={handlePdfClick}
                    disabled={!hasContent}
                    aria-label="Download PDF"
                    title="Download PDF"
                    className={cn(
                        'disabled:opacity-50',
                        'download-button-click-trigger',
                        className,
                    )}
                >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download PDF</span>
                </Button>
                <Button
                    variant={variant}
                    size="icon"
                    disabled={!hasContent}
                    aria-label="Download format menu"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsOpen((prev) => !prev);
                    }}
                    className={cn('h-9 w-5 disabled:opacity-50', className)}
                >
                    <ChevronDown className="h-3 w-3" />
                </Button>
                {menu}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative inline-flex', 'w-full sm:w-auto')}
            data-download-menu-root="true"
        >
            <Button
                variant="sage"
                onClick={handlePdfClick}
                disabled={!hasContent}
                className={cn(
                    'min-w-[260px]',
                    'disabled:opacity-50',
                    'w-full sm:w-auto download-button-click-trigger',
                    'rounded-r-none border-r border-docmosaic-black/10',
                )}
                icon={<Download className="h-4 w-4" />}
            >
                Download PDF
            </Button>
            <Button
                variant="sage"
                size="icon"
                disabled={!hasContent}
                aria-label="Download format menu"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={(event) => {
                    event.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={cn('rounded-l-none px-2', 'disabled:opacity-50')}
            >
                <ChevronDown className="h-4 w-4" />
            </Button>
            {menu}
        </div>
    );
}
