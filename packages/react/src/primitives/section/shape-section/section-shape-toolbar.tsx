'use client';

import type { ShapeSection } from '@docmosaic/core';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

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
export function SectionShapeToolbar({
    section,
    isSelected,
    onUpdate,
}: SectionShapeToolbarProps) {
    const stroke = section.stroke ?? '#000000';
    const fill = section.fill ?? 'transparent';
    const isTransparentFill = fill === 'transparent';
    const strokeWidth = section.strokeWidth ?? 1;

    const bumpStrokeWidth = (delta: number) => {
        const next = Math.max(
            MIN_STROKE_WIDTH,
            Math.min(MAX_STROKE_WIDTH, strokeWidth + delta),
        );
        if (next !== strokeWidth) {
            onUpdate({ strokeWidth: next });
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
            <label
                className="flex items-center gap-1 px-1 pointer-events-auto"
                title="Stroke color"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-[10px] uppercase text-gray-500">Stroke</span>
                <input
                    type="color"
                    value={normalizeColorForInput(stroke)}
                    className="h-6 w-6 rounded border border-gray-200 bg-white"
                    onChange={(e) => onUpdate({ stroke: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
            </label>

            <div className="w-px h-5 bg-gray-200" />

            <label
                className="flex items-center gap-1 px-1 pointer-events-auto"
                title="Fill color"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-[10px] uppercase text-gray-500">Fill</span>
                <input
                    type="color"
                    value={normalizeColorForInput(isTransparentFill ? '#ffffff' : fill)}
                    disabled={isTransparentFill}
                    className={cn(
                        'h-6 w-6 rounded border border-gray-200 bg-white',
                        isTransparentFill && 'opacity-50',
                    )}
                    onChange={(e) => onUpdate({ fill: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                />
                <label
                    className="flex items-center gap-1 text-[10px] text-gray-600 cursor-pointer"
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

            <div className="w-px h-5 bg-gray-200" />

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
                className="text-xs font-medium text-gray-700 px-1 min-w-[24px] text-center pointer-events-auto"
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
