'use client';

import type { TextSection } from '@docmosaic/core';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Plus } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

interface TextToolbarProps {
    section: TextSection;
    isSelected: boolean;
    onUpdate: (next: Partial<TextSection>) => void;
}

/** Minimum font size in PDF points. */
const MIN_FONT_SIZE = 6;
/** Maximum font size in PDF points. */
const MAX_FONT_SIZE = 120;
/** Step in points per click on +/-. */
const FONT_SIZE_STEP = 2;

/** Subtle filled state for an active toggle, layered onto the ghost variant. */
const ACTIVE = 'bg-accent text-accent-foreground';

/**
 * Floating toolbar for {@link TextSection}: alignment, bold, italic, and
 * font-size +/-. Rendered as a `card`-surfaced popover so it stays legible
 * over the page in both light and dark themes; the active toggle uses the
 * subtle `accent` fill rather than a bright brand color.
 */
export function TextToolbar({ section, isSelected, onUpdate }: TextToolbarProps) {
    const align = section.align ?? 'left';
    const isBold = section.fontWeight === 'bold';
    const isItalic = section.fontStyle === 'italic';

    const bumpFontSize = (delta: number) => {
        const next = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, section.fontSize + delta));
        if (next !== section.fontSize) {
            onUpdate({ fontSize: next });
        }
    };

    // Float above the box by default (Figma's format bar), but flip below when
    // the box sits near the top of the canvas and there's no room above —
    // otherwise the bar would clip into the ruler / top chrome.
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [placeBelow, setPlaceBelow] = useState(false);
    useLayoutEffect(() => {
        const measure = () => {
            const el = toolbarRef.current;
            if (!el) return;
            // Measure the box (stable), not the toolbar (whose position is what
            // we are deciding) — measuring the toolbar would oscillate.
            const box = el.closest('[data-section="true"]');
            const scroller = el.closest('.overflow-auto');
            if (!box) return;
            const boxTop = box.getBoundingClientRect().top;
            const limit = scroller ? scroller.getBoundingClientRect().top : 0;
            // ~52px ≈ toolbar height + gap. Flip below when there's no room above.
            setPlaceBelow(boxTop - limit < 52);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [section.x, section.y, section.width, section.height, section.fontSize]);

    return (
        <div
            ref={toolbarRef}
            className={cn(
                // Left-aligned to the box and extending rightward, so a box at
                // the left edge (the default position) never pushes the toolbar
                // off-canvas. Sits above the box, or below when there's no room.
                'absolute left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
                placeBelow ? 'top-full mt-2' : 'bottom-full mb-2',
                'pointer-events-none opacity-0 transition-opacity group-hover:opacity-100',
                isSelected && 'opacity-100',
            )}
        >
            <Button
                size="icon"
                variant="ghost"
                className={cn('pointer-events-auto h-8 w-8', align === 'left' && ACTIVE)}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ align: 'left' });
                }}
                title="Align left"
            >
                <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={cn('pointer-events-auto h-8 w-8', align === 'center' && ACTIVE)}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ align: 'center' });
                }}
                title="Align center"
            >
                <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={cn('pointer-events-auto h-8 w-8', align === 'right' && ACTIVE)}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ align: 'right' });
                }}
                title="Align right"
            >
                <AlignRight className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-border" />

            <Button
                size="icon"
                variant="ghost"
                className={cn('pointer-events-auto h-8 w-8', isBold && ACTIVE)}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ fontWeight: isBold ? 'normal' : 'bold' });
                }}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className={cn('pointer-events-auto h-8 w-8', isItalic && ACTIVE)}
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
                }}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-border" />

            <Button
                size="icon"
                variant="ghost"
                className="pointer-events-auto h-8 w-8"
                onClick={(e) => {
                    e.stopPropagation();
                    bumpFontSize(-FONT_SIZE_STEP);
                }}
                title="Decrease font size"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span
                className="pointer-events-auto min-w-[28px] px-1 text-center text-xs font-medium text-foreground"
                title="Font size"
            >
                {section.fontSize}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="pointer-events-auto h-8 w-8"
                onClick={(e) => {
                    e.stopPropagation();
                    bumpFontSize(FONT_SIZE_STEP);
                }}
                title="Increase font size"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
