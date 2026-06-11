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

/**
 * Floating toolbar for {@link TextSection}: alignment, bold, italic, and
 * font-size +/-. Mirrors the visual style of the image-section toolbar so
 * the two variants feel like one family.
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
                'absolute top-2 right-2 flex items-center gap-1 bg-white rounded-lg shadow-md p-1 z-50 pointer-events-none',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
            )}
        >
            <Button
                size="icon"
                variant={align === 'left' ? 'caramel' : 'ghost'}
                className="h-8 w-8 pointer-events-auto"
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
                variant={align === 'center' ? 'caramel' : 'ghost'}
                className="h-8 w-8 pointer-events-auto"
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
                variant={align === 'right' ? 'caramel' : 'ghost'}
                className="h-8 w-8 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ align: 'right' });
                }}
                title="Align right"
            >
                <AlignRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-gray-200" />

            <Button
                size="icon"
                variant={isBold ? 'caramel' : 'ghost'}
                className="h-8 w-8 pointer-events-auto"
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
                variant={isItalic ? 'caramel' : 'ghost'}
                className="h-8 w-8 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ fontStyle: isItalic ? 'normal' : 'italic' });
                }}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-gray-200" />

            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    bumpFontSize(-FONT_SIZE_STEP);
                }}
                title="Decrease font size"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span
                className="text-xs font-medium text-gray-700 px-1 min-w-[28px] text-center pointer-events-auto"
                title="Font size"
            >
                {section.fontSize}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
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
