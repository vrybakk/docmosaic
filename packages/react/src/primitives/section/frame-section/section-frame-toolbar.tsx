'use client';

import type { FrameSection } from '@docmosaic/core';
import { Minus, Plus } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

interface SectionFrameToolbarProps {
    section: FrameSection;
    isSelected: boolean;
    onUpdate: (next: Partial<FrameSection>) => void;
}

/** Minimum border width in PDF points. */
const MIN_BORDER_WIDTH = 1;
/** Maximum border width in PDF points. */
const MAX_BORDER_WIDTH = 24;

/**
 * Floating toolbar for {@link FrameSection}: fill color, border color, and
 * border width. Mirrors the shape toolbar's float-above-with-flip behavior so
 * every section variant's toolbar reads the same. Both fill and border expose
 * a "none" toggle so a frame can be a pure grouping box (`'transparent'`).
 */
export function SectionFrameToolbar({ section, isSelected, onUpdate }: SectionFrameToolbarProps) {
    const fill = section.fill ?? 'transparent';
    const stroke = section.stroke ?? 'transparent';
    const isTransparentFill = fill === 'transparent';
    const isTransparentStroke = stroke === 'transparent';
    const strokeWidth = section.strokeWidth ?? 1;

    const bumpBorderWidth = (delta: number) => {
        const next = Math.max(MIN_BORDER_WIDTH, Math.min(MAX_BORDER_WIDTH, strokeWidth + delta));
        if (next !== strokeWidth) onUpdate({ strokeWidth: next });
    };

    // Float above the frame, flipping below when the box sits near the top of
    // the canvas — same logic as the text/shape/image toolbars.
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [placeBelow, setPlaceBelow] = useState(false);
    useLayoutEffect(() => {
        const measure = () => {
            const el = toolbarRef.current;
            if (!el) return;
            const box = el.closest('[data-section="true"]');
            const scroller = el.closest('.overflow-auto');
            if (!box) return;
            const boxTop = box.getBoundingClientRect().top;
            const limit = scroller ? scroller.getBoundingClientRect().top : 0;
            setPlaceBelow(boxTop - limit < 52);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [section.x, section.y, section.width, section.height]);

    return (
        <div
            ref={toolbarRef}
            className={cn(
                'absolute left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
                placeBelow ? 'top-full mt-2' : 'bottom-full mb-2',
                'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
            )}
        >
            <label
                className="flex items-center gap-1 px-1 pointer-events-auto"
                title="Fill color"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-[10px] uppercase text-muted-foreground">Fill</span>
                <input
                    type="color"
                    value={normalizeColorForInput(isTransparentFill ? '#ffffff' : fill)}
                    disabled={isTransparentFill}
                    className={cn(
                        'h-6 w-6 rounded border border-border bg-white',
                        isTransparentFill && 'opacity-50',
                    )}
                    onChange={(e) => onUpdate({ fill: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
                <label
                    className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground"
                    title="No fill"
                >
                    <input
                        type="checkbox"
                        checked={isTransparentFill}
                        className="h-3 w-3"
                        onChange={(e) =>
                            onUpdate({ fill: e.target.checked ? 'transparent' : '#ffffff' })
                        }
                        onClick={(e) => e.stopPropagation()}
                    />
                    none
                </label>
            </label>

            <div className="h-5 w-px bg-border" />

            <label
                className="flex items-center gap-1 px-1 pointer-events-auto"
                title="Border color"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-[10px] uppercase text-muted-foreground">Border</span>
                <input
                    type="color"
                    value={normalizeColorForInput(isTransparentStroke ? '#000000' : stroke)}
                    disabled={isTransparentStroke}
                    className={cn(
                        'h-6 w-6 rounded border border-border bg-white',
                        isTransparentStroke && 'opacity-50',
                    )}
                    onChange={(e) => onUpdate({ stroke: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
                <label
                    className="flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground"
                    title="No border"
                >
                    <input
                        type="checkbox"
                        checked={isTransparentStroke}
                        className="h-3 w-3"
                        onChange={(e) =>
                            onUpdate({ stroke: e.target.checked ? 'transparent' : '#000000' })
                        }
                        onClick={(e) => e.stopPropagation()}
                    />
                    none
                </label>
            </label>

            <div className="h-5 w-px bg-border" />

            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
                disabled={isTransparentStroke}
                onClick={(e) => {
                    e.stopPropagation();
                    bumpBorderWidth(-1);
                }}
                title="Decrease border width"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span
                className="pointer-events-auto min-w-[24px] px-1 text-center text-xs font-medium text-foreground"
                title="Border width"
            >
                {strokeWidth}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
                disabled={isTransparentStroke}
                onClick={(e) => {
                    e.stopPropagation();
                    bumpBorderWidth(1);
                }}
                title="Increase border width"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * `<input type="color">` only accepts a 7-char `#rrggbb` literal. Hand off
 * named colors and short hex by falling back to black when they don't match.
 */
function normalizeColorForInput(value: string): string {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        const r = value[1];
        const g = value[2];
        const b = value[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#000000';
}
