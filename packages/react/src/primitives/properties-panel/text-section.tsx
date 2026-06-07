'use client';

import type { TextSection } from '@docmosaic/core';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Input } from '../../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { ColorPicker } from '../color-picker';
import { FieldLabel, SectionShell } from './section-shell';

/**
 * Font families exposed by the panel. Mirrors the jspdf-built-in set so the
 * editor preview and the generated PDF stay in sync.
 */
const FONT_FAMILIES = [
    { value: 'helvetica', label: 'Helvetica' },
    { value: 'times', label: 'Times' },
    { value: 'courier', label: 'Courier' },
] as const;

interface TextSectionPropertiesProps {
    className?: string;
}

/**
 * Text sub-section of {@link PropertiesPanel}. Surfaces the typography fields
 * of a {@link TextSection} — font family, size, weight, style, color, and
 * alignment.
 *
 * Hidden when no text section is selected. With multiple selected sections,
 * the panel only renders when *every* selected section is a text section —
 * matches the "common properties only" rule used by the parent panel for the
 * multi-select case. Commit updates apply to every selected text section.
 */
export function TextSectionProperties({ className }: TextSectionPropertiesProps = {}) {
    const { state, ui, actions } = useEditor();
    const selectedIds = ui.selectedSectionIds;

    const textSections = useMemo<TextSection[]>(() => {
        const selected = state.sections.filter((s) => selectedIds.has(s.id));
        if (selected.length === 0) return [];
        if (!selected.every((s) => s.type === 'text')) return [];
        return selected as TextSection[];
    }, [state.sections, selectedIds]);

    if (textSections.length === 0) return null;

    const primary = textSections[0];

    const applyUpdate = (patch: Partial<TextSection>) => {
        for (const section of textSections) {
            actions.updateSection({ ...section, ...patch });
        }
    };

    return (
        <SectionShell title="Text" className={className}>
            <FontFamilyField
                value={primary.fontFamily ?? 'helvetica'}
                onChange={(fontFamily) => applyUpdate({ fontFamily })}
            />
            <FontSizeField
                value={primary.fontSize}
                onCommit={(fontSize) => applyUpdate({ fontSize })}
            />
            <div className="grid grid-cols-2 gap-2">
                <StyleToggle
                    label="Bold"
                    icon={<Bold className="h-3.5 w-3.5" />}
                    pressed={primary.fontWeight === 'bold'}
                    onToggle={() =>
                        applyUpdate({
                            fontWeight: primary.fontWeight === 'bold' ? 'normal' : 'bold',
                        })
                    }
                />
                <StyleToggle
                    label="Italic"
                    icon={<Italic className="h-3.5 w-3.5" />}
                    pressed={primary.fontStyle === 'italic'}
                    onToggle={() =>
                        applyUpdate({
                            fontStyle: primary.fontStyle === 'italic' ? 'normal' : 'italic',
                        })
                    }
                />
            </div>
            <AlignField
                value={primary.align ?? 'left'}
                onChange={(align) => applyUpdate({ align })}
            />
            <div className="space-y-1">
                <FieldLabel>Color</FieldLabel>
                <ColorPicker
                    value={primary.color ?? '#000000'}
                    onChange={(color) => applyUpdate({ color })}
                />
            </div>
        </SectionShell>
    );
}

interface FontFamilyFieldProps {
    value: string;
    onChange: (value: string) => void;
}

function FontFamilyField({ value, onChange }: FontFamilyFieldProps) {
    return (
        <div className="space-y-1">
            <FieldLabel htmlFor="properties-font-family">Font</FieldLabel>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id="properties-font-family" className="h-7 text-xs">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value} className="text-xs">
                            {font.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

interface FontSizeFieldProps {
    value: number;
    onCommit: (value: number) => void;
}

function FontSizeField({ value, onCommit }: FontSizeFieldProps) {
    const [draft, setDraft] = useState<string>(String(value));

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const active = document.activeElement;
        if (active && active.getAttribute('aria-label') === 'Font size') return;
        setDraft(String(value));
    }, [value]);

    return (
        <div className="space-y-1">
            <FieldLabel htmlFor="properties-font-size">Size</FieldLabel>
            <Input
                id="properties-font-size"
                type="number"
                aria-label="Font size"
                min={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                    const parsed = Number(draft);
                    if (!Number.isNaN(parsed) && parsed > 0) onCommit(parsed);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                }}
                className="h-7 px-2 text-xs"
            />
        </div>
    );
}

interface StyleToggleProps {
    label: string;
    icon: React.ReactNode;
    pressed: boolean;
    onToggle: () => void;
}

function StyleToggle({ label, icon, pressed, onToggle }: StyleToggleProps) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={pressed}
            onClick={onToggle}
            className={cn(
                'h-7 inline-flex items-center justify-center rounded-md border',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent',
                pressed
                    ? 'border-editor-accent bg-editor-accent-soft text-editor-text'
                    : 'border-editor-accent/15 bg-editor-surface text-editor-text hover:bg-editor-accent-soft',
            )}
        >
            {icon}
        </button>
    );
}

interface AlignFieldProps {
    value: 'left' | 'center' | 'right';
    onChange: (value: 'left' | 'center' | 'right') => void;
}

function AlignField({ value, onChange }: AlignFieldProps) {
    const options: Array<{ value: 'left' | 'center' | 'right'; icon: React.ReactNode; label: string }> = [
        { value: 'left', icon: <AlignLeft className="h-3.5 w-3.5" />, label: 'Align left' },
        { value: 'center', icon: <AlignCenter className="h-3.5 w-3.5" />, label: 'Align center' },
        { value: 'right', icon: <AlignRight className="h-3.5 w-3.5" />, label: 'Align right' },
    ];
    return (
        <div className="space-y-1">
            <FieldLabel>Align</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
                {options.map((option) => {
                    const pressed = option.value === value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-label={option.label}
                            aria-pressed={pressed}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'h-7 inline-flex items-center justify-center rounded-md border',
                                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editor-accent',
                                pressed
                                    ? 'border-editor-accent bg-editor-accent-soft text-editor-text'
                                    : 'border-editor-accent/15 bg-editor-surface text-editor-text hover:bg-editor-accent-soft',
                            )}
                        >
                            {option.icon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
