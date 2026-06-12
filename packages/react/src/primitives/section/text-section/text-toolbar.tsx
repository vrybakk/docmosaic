'use client';

import type { TextSection } from '@docmosaic/core';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Plus } from 'lucide-react';
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

    return (
        <div
            className={cn(
                'absolute right-2 top-2 z-50 flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
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
