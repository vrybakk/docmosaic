'use client';

import { cn } from '../internal/utils';

export interface BrushWeightSliderProps {
    /** Active brush weight in PDF points (1–20). */
    value: number;
    /** Fired when the user moves the slider. */
    onChange: (weight: number) => void;
    /** Optional minimum weight. Defaults to `1`. */
    min?: number;
    /** Optional maximum weight. Defaults to `20`. */
    max?: number;
    /** Optional preview color used by the swatch. Defaults to current weight color. */
    previewColor?: string;
    className?: string;
}

/**
 * Slider for picking a brush weight between `min` and `max` PDF points,
 * paired with a circular preview that scales with the current value so the
 * user can see the stroke thickness before committing.
 *
 * Stateless: the weight flows in through `value` and out through `onChange`.
 * Composed by `Editor.DrawingControls` to feed the editor's `ui.drawingWeight`.
 *
 * @example
 * ```tsx
 * <Editor.BrushWeightSlider value={weight} onChange={setWeight} />
 * ```
 */
export function BrushWeightSlider({
    value,
    onChange,
    min = 1,
    max = 20,
    previewColor = '#000000',
    className,
}: BrushWeightSliderProps) {
    return (
        <div className={cn('flex items-center gap-3', className)} data-brush-weight-slider="true">
            <div
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center"
                data-brush-preview="true"
            >
                <div
                    className="rounded-full"
                    style={{
                        backgroundColor: previewColor,
                        width: `${value}px`,
                        height: `${value}px`,
                    }}
                />
            </div>
            <input
                type="range"
                aria-label="Brush weight"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="h-2 w-32 cursor-pointer accent-primary"
            />
            <span className="w-7 text-right text-xs text-gray-600 tabular-nums">{value}</span>
        </div>
    );
}
