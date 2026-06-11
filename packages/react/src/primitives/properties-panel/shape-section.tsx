'use client';

import type { ShapeSection } from '@docmosaic/core';
import { useMemo } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { ColorPicker } from '../color-picker';
import { FieldLabel, SectionShell } from './section-shell';

interface ShapeSectionPropertiesProps {
    className?: string;
}

/**
 * Shape sub-section of {@link PropertiesPanel}. Surfaces the visual fields of
 * a {@link ShapeSection} — fill, stroke, stroke width, and opacity.
 *
 * Hidden when no shape section is selected. With multiple selected sections,
 * the panel only renders when *every* selected section is a shape section —
 * matches the "common properties only" rule used by the parent panel for the
 * multi-select case. Commit updates apply to every selected shape section.
 */
export function ShapeSectionProperties({ className }: ShapeSectionPropertiesProps = {}) {
    const { state, ui, actions, readOnly } = useEditor();
    const selectedIds = ui.selectedSectionIds;

    const shapeSections = useMemo<ShapeSection[]>(() => {
        const selected = state.sections.filter((s) => selectedIds.has(s.id));
        if (selected.length === 0) return [];
        if (!selected.every((s) => s.type === 'shape')) return [];
        return selected as ShapeSection[];
    }, [state.sections, selectedIds]);

    if (shapeSections.length === 0) return null;

    const primary = shapeSections[0];

    const applyUpdate = (patch: Partial<ShapeSection>) => {
        if (readOnly) return;
        for (const section of shapeSections) {
            actions.updateSection({ ...section, ...patch });
        }
    };

    return (
        <SectionShell title="Styles" className={className}>
            <div className="space-y-1">
                <FieldLabel>Fill</FieldLabel>
                <ColorPicker
                    value={primary.fill === 'transparent' ? '#ffffff' : (primary.fill ?? '#ffffff')}
                    onChange={(fill) => applyUpdate({ fill })}
                    disabled={readOnly}
                />
            </div>
            <div className="space-y-1">
                <FieldLabel>Stroke</FieldLabel>
                <ColorPicker
                    value={primary.stroke ?? '#000000'}
                    onChange={(stroke) => applyUpdate({ stroke })}
                    disabled={readOnly}
                />
            </div>
            <SliderField
                label="Stroke width"
                ariaLabel="Stroke width"
                min={0}
                max={10}
                step={1}
                value={primary.strokeWidth ?? 1}
                onChange={(v) => applyUpdate({ strokeWidth: v })}
                displayValue={String(primary.strokeWidth ?? 1)}
                disabled={readOnly}
            />
            <SliderField
                label="Opacity"
                ariaLabel="Opacity"
                min={0}
                max={100}
                step={1}
                value={Math.round((primary.opacity ?? 1) * 100)}
                onChange={(v) => applyUpdate({ opacity: v / 100 })}
                displayValue={`${Math.round((primary.opacity ?? 1) * 100)}%`}
                disabled={readOnly}
            />
        </SectionShell>
    );
}

interface SliderFieldProps {
    label: string;
    ariaLabel: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    displayValue: string;
    disabled?: boolean;
}

function SliderField({
    label,
    ariaLabel,
    min,
    max,
    step,
    value,
    onChange,
    displayValue,
    disabled,
}: SliderFieldProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <FieldLabel>{label}</FieldLabel>
                <span className="text-[10px] tabular-nums text-foreground/60">{displayValue}</span>
            </div>
            <input
                type="range"
                aria-label={ariaLabel}
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className={cn(
                    'h-2 w-full cursor-pointer accent-primary',
                    disabled && 'opacity-50 cursor-not-allowed',
                )}
            />
        </div>
    );
}
