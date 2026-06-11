'use client';

import { useRef } from 'react';
import { cn } from '../internal/utils';

/**
 * Default 12-color preset palette exposed by {@link ColorPicker}. Picked to
 * cover neutrals (black, grays, white) plus a balanced rainbow so the editor
 * has a sensible default surface without making product opinions about brand.
 */
export const DEFAULT_COLOR_PRESETS: readonly string[] = [
    '#000000',
    '#525252',
    '#9CA3AF',
    '#FFFFFF',
    '#EF4444',
    '#F59E0B',
    '#EAB308',
    '#22C55E',
    '#06B6D4',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
];

export interface ColorPickerProps {
    /** Currently-selected color (CSS color string). */
    value: string;
    /** Fired when the user picks a swatch or commits a custom color. */
    onChange: (color: string) => void;
    /**
     * Optional override for the swatch palette. Defaults to
     * {@link DEFAULT_COLOR_PRESETS} (12 colors).
     */
    presets?: readonly string[];
    className?: string;
    /**
     * When `true`, the swatches and custom-color trigger become non-interactive
     * and visually dim. The current `value` still shows so the swatch remains
     * a label for the actively-selected color.
     */
    disabled?: boolean;
}

/**
 * Presentational color picker. Shows a small preset palette plus a "custom"
 * trigger that opens a native `<input type="color">` so users can dial in any
 * shade the browser supports.
 *
 * Stateless: the active color flows in through `value` and selections flow
 * out through `onChange`. Composed by `Editor.DrawingControls` to feed the
 * editor's `ui.drawingColor`.
 *
 * @example
 * ```tsx
 * <Editor.ColorPicker value={color} onChange={setColor} />
 * ```
 */
export function ColorPicker({
    value,
    onChange,
    presets = DEFAULT_COLOR_PRESETS,
    className,
    disabled = false,
}: ColorPickerProps) {
    const customInputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className={cn('flex items-center gap-2', disabled && 'opacity-60', className)}
            data-color-picker="true"
            aria-disabled={disabled || undefined}
        >
            <div className="grid grid-cols-6 gap-1.5">
                {presets.map((preset) => {
                    const isActive = preset.toLowerCase() === value.toLowerCase();
                    return (
                        <button
                            key={preset}
                            type="button"
                            aria-label={`Pick color ${preset}`}
                            aria-pressed={isActive}
                            disabled={disabled}
                            onClick={() => onChange(preset)}
                            className={cn(
                                'h-6 w-6 rounded-md border transition-shadow',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isActive
                                    ? 'border-primary ring-2 ring-primary'
                                    : 'border-gray-300 hover:border-gray-500',
                                disabled && 'cursor-not-allowed',
                            )}
                            style={{ backgroundColor: preset }}
                        />
                    );
                })}
            </div>
            <div className="relative">
                <button
                    type="button"
                    aria-label="Pick custom color"
                    disabled={disabled}
                    onClick={() => customInputRef.current?.click()}
                    className={cn(
                        'h-6 w-6 rounded-md border border-dashed border-gray-400',
                        'bg-white hover:border-gray-600',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'flex items-center justify-center text-xs text-gray-500',
                        disabled && 'cursor-not-allowed',
                    )}
                    title="Custom color"
                >
                    +
                </button>
                <input
                    ref={customInputRef}
                    type="color"
                    aria-label="Custom color input"
                    data-custom-color-input="true"
                    className="sr-only"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
