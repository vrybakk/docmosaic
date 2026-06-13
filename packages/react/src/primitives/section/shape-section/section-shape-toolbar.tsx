'use client';

import type { ShapeKind, ShapeSection } from '@docmosaic/core';
import { Circle, Minus, Plus, Square } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

/** Shape primitives offered by the in-toolbar kind switcher. */
const SHAPE_KINDS: { value: ShapeKind; label: string; Icon: typeof Square }[] = [
    { value: 'rect', label: 'Rectangle', Icon: Square },
    { value: 'circle', label: 'Circle', Icon: Circle },
    { value: 'line', label: 'Line', Icon: Minus },
];

interface SectionShapeToolbarProps {
    section: ShapeSection;
    isSelected: boolean;
    onUpdate: (next: Partial<ShapeSection>) => void;
}

/** Minimum stroke width in PDF points. */
const MIN_STROKE_WIDTH = 1;
/** Maximum stroke width in PDF points. */
const MAX_STROKE_WIDTH = 24;
/** Step in points per click on +/-. */
const STROKE_WIDTH_STEP = 1;

/**
 * Floating toolbar for {@link ShapeSection}: stroke color, fill color, and
 * stroke width controls. Native `<input type="color">` is intentional here —
 * Phase 15 will swap it for the package-wide ColorPicker primitive.
 *
 * @remarks
 * The fill picker exposes a "no fill" checkbox so users can render a
 * stroke-only shape (`fill: 'transparent'`) without remembering the magic
 * string.
 */
export function SectionShapeToolbar({ section, isSelected, onUpdate }: SectionShapeToolbarProps) {
    const stroke = section.stroke ?? '#000000';
    const fill = section.fill ?? 'transparent';
    const isTransparentFill = fill === 'transparent';
    const strokeWidth = section.strokeWidth ?? 1;

    const bumpStrokeWidth = (delta: number) => {
        const next = Math.max(MIN_STROKE_WIDTH, Math.min(MAX_STROKE_WIDTH, strokeWidth + delta));
        if (next !== strokeWidth) {
            onUpdate({ strokeWidth: next });
        }
    };

    // Float above the shape (Figma's format bar), flipping below when the box
    // sits near the top of the canvas and there's no room above — mirrors the
    // text toolbar so both variants behave the same.
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
                // Left-aligned to the box, floating above it (or below when there's
                // no room) so it never overlaps the shape itself.
                'absolute left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
                placeBelow ? 'top-full mt-2' : 'bottom-full mb-2',
                'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
            )}
        >
            <div className="flex items-center gap-0.5 px-1 pointer-events-auto">
                {SHAPE_KINDS.map(({ value, label, Icon }) => (
                    <Button
                        key={value}
                        size="icon"
                        variant={section.shape === value ? 'secondary' : 'ghost'}
                        className="h-7 w-7"
                        aria-pressed={section.shape === value}
                        aria-label={label}
                        title={label}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (section.shape !== value) onUpdate({ shape: value });
                        }}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                ))}
            </div>

            <div className="h-5 w-px bg-border" />

            <label
                className="flex items-center gap-1 px-1 pointer-events-auto"
                title="Stroke color"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-[10px] uppercase text-muted-foreground">Stroke</span>
                <input
                    type="color"
                    value={normalizeColorForInput(stroke)}
                    className="h-6 w-6 rounded border border-border bg-white"
                    onChange={(e) => onUpdate({ stroke: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
            </label>

            <div className="h-5 w-px bg-border" />

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

            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    bumpStrokeWidth(-STROKE_WIDTH_STEP);
                }}
                title="Decrease stroke width"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <span
                className="pointer-events-auto min-w-[24px] px-1 text-center text-xs font-medium text-foreground"
                title="Stroke width"
            >
                {strokeWidth}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    bumpStrokeWidth(STROKE_WIDTH_STEP);
                }}
                title="Increase stroke width"
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
