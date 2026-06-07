'use client';

import type { Section } from '@docmosaic/core';
import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Input } from '../../ui/input';
import { FieldLabel, SectionShell } from './section-shell';

interface LayoutSectionProps {
    className?: string;
}

/**
 * Layout sub-section of {@link PropertiesPanel}. Exposes the four geometry
 * fields shared by every section variant — `x`, `y`, `width`, `height` — in
 * PDF points (72 DPI).
 *
 * Reads the current selection from {@link useEditor}. When more than one
 * section is selected, the inputs show the value of the first section in the
 * selection set; committing any field applies the new value to every selected
 * section so they all share the new coordinate. Empties out when the
 * selection is empty.
 */
export function LayoutSection({ className }: LayoutSectionProps = {}) {
    const { state, ui, actions } = useEditor();
    const selectedIds = ui.selectedSectionIds;

    const selectedSections = useMemo<Section[]>(
        () => state.sections.filter((s) => selectedIds.has(s.id)),
        [state.sections, selectedIds],
    );

    if (selectedSections.length === 0) return null;

    const primary = selectedSections[0];

    const onCommit = (field: 'x' | 'y' | 'width' | 'height', raw: string) => {
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) return;
        // Width/height must stay positive — clamp to 1 so the section never
        // collapses to zero geometry (which would make it un-selectable).
        const value = field === 'width' || field === 'height' ? Math.max(1, parsed) : parsed;
        for (const section of selectedSections) {
            actions.updateSection({ ...section, [field]: value } as Section);
        }
    };

    return (
        <SectionShell title="Layout" className={className}>
            <div className="grid grid-cols-2 gap-2">
                <NumberField
                    label="X"
                    value={primary.x}
                    onCommit={(v) => onCommit('x', v)}
                    ariaLabel="Position X"
                />
                <NumberField
                    label="Y"
                    value={primary.y}
                    onCommit={(v) => onCommit('y', v)}
                    ariaLabel="Position Y"
                />
                <NumberField
                    label="W"
                    value={primary.width}
                    onCommit={(v) => onCommit('width', v)}
                    ariaLabel="Width"
                    min={1}
                />
                <NumberField
                    label="H"
                    value={primary.height}
                    onCommit={(v) => onCommit('height', v)}
                    ariaLabel="Height"
                    min={1}
                />
            </div>
        </SectionShell>
    );
}

interface NumberFieldProps {
    label: string;
    value: number;
    onCommit: (raw: string) => void;
    ariaLabel: string;
    min?: number;
    className?: string;
}

/**
 * Compact labeled number input used by `LayoutSection` (and reusable inside
 * future sub-sections). Local state lets the user type intermediate values
 * (e.g. an empty field while editing) — the commit fires on blur and on Enter
 * so the document only updates on intentional submission, not per-keystroke.
 */
function NumberField({ label, value, onCommit, ariaLabel, min, className }: NumberFieldProps) {
    const [draft, setDraft] = useState<string>(String(Math.round(value)));

    // Keep the visible value in sync when the underlying section changes
    // (group drag, undo, etc.). Only overwrite when the field isn't focused
    // so we don't yank a half-typed value out from under the user.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const active = document.activeElement;
        if (active && active.getAttribute('aria-label') === ariaLabel) return;
        setDraft(String(Math.round(value)));
    }, [value, ariaLabel]);

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <FieldLabel className="w-3 text-right">{label}</FieldLabel>
            <Input
                type="number"
                aria-label={ariaLabel}
                min={min}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => onCommit(draft)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur();
                    }
                }}
                className="h-7 px-2 text-xs"
            />
        </div>
    );
}
