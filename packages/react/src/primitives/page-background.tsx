'use client';

import type { PageBackground as CorePageBackground } from '@docmosaic/core';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useEditor } from '../context/editor';
import { cn } from '../internal/utils';
import { Button } from '../ui/button';

interface PageBackgroundProps {
    /**
     * Page to target. Defaults to the document's current page (1-based
     * index, converted to 0-based internally to match the reducer action).
     */
    pageIndex?: number;
    className?: string;
}

/**
 * Compound primitive — picks the background color and optional image for a
 * page. Wires to {@link useEditor}'s `setPageBackground` action; reads the
 * current background from the active page.
 *
 * @remarks
 * Native `<input type="color">` and `<input type="file">` are intentional
 * for Phase 14 — Phase 15 will swap the color slot for the package-wide
 * ColorPicker primitive once it lands.
 *
 * @example
 * ```tsx
 * <Editor.PageBackground />
 * <Editor.PageBackground pageIndex={2} />
 * ```
 */
export function PageBackground({ pageIndex, className }: PageBackgroundProps = {}) {
    const { state, actions, readOnly } = useEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (readOnly) return null;

    const targetIndex = pageIndex ?? state.currentPage - 1;
    const page = state.pages[targetIndex];
    const background: CorePageBackground | undefined = page?.background;
    const color = background?.color ?? '';
    const hasImage = Boolean(background?.image);

    const updateColor = (nextColor: string | undefined) => {
        const next: CorePageBackground = { ...(background ?? {}) };
        if (nextColor) {
            next.color = nextColor;
        } else {
            delete next.color;
        }
        actions.setPageBackground(targetIndex, next.color || next.image ? next : undefined);
    };

    const updateImage = (nextImage: string | undefined) => {
        const next: CorePageBackground = { ...(background ?? {}) };
        if (nextImage) {
            next.image = nextImage;
        } else {
            delete next.image;
        }
        actions.setPageBackground(targetIndex, next.color || next.image ? next : undefined);
    };

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') updateImage(result);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearAll = () => {
        actions.setPageBackground(targetIndex, undefined);
    };

    if (!page) return null;

    return (
        <div
            className={cn(
                'flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200',
                className,
            )}
            data-page-background-picker="true"
        >
            <label className="flex items-center gap-2 text-xs text-gray-600">
                Color
                <input
                    type="color"
                    value={normalizeColorForInput(color || '#ffffff')}
                    className="h-7 w-7 rounded border border-gray-200"
                    onChange={(e) => updateColor(e.target.value)}
                />
                {color && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-xs text-gray-500"
                        onClick={() => updateColor(undefined)}
                        title="Clear color"
                    >
                        Clear
                    </Button>
                )}
            </label>

            <div className="w-px h-5 bg-gray-200" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<ImageIcon className="h-3 w-3" />}
                title="Upload background image"
            >
                {hasImage ? 'Replace image' : 'Add image'}
            </Button>
            {hasImage && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => updateImage(undefined)}
                    title="Remove background image"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
            />

            {(color || hasImage) && (
                <>
                    <div className="w-px h-5 bg-gray-200" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                        onClick={clearAll}
                        title="Clear background"
                    >
                        Reset
                    </Button>
                </>
            )}
        </div>
    );
}

/**
 * `<input type="color">` only accepts a 7-char `#rrggbb` literal — names and
 * `rgb()` strings get clipped to black. Fall back to white so the swatch
 * stays readable when an unsupported color is in state.
 */
function normalizeColorForInput(value: string): string {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        const r = value[1];
        const g = value[2];
        const b = value[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#ffffff';
}
