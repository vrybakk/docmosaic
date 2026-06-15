'use client';

import type { ShapeKind } from '@docmosaic/core';
import { Circle, ImagePlus, Square } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select';

interface ImageFrameToolButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the idle (not-armed) variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Override the armed variant. Defaults to `'orange'`. */
    activeVariant?: ButtonProps['variant'];
    /** Extra classes merged onto the toggle button while idle. */
    className?: string;
    /** Extra classes merged onto the toggle button while the tool is armed. */
    activeClassName?: string;
}

/** Mask shapes offered for placeholder frames. `line` is not a meaningful mask. */
const MASK_KINDS: { value: ShapeKind; label: string; Icon: typeof Square }[] = [
    { value: 'rect', label: 'Rectangle', Icon: Square },
    { value: 'circle', label: 'Circle', Icon: Circle },
];

/**
 * Draw-to-size placeholder-frame (image-slot) tool. The toggle arms
 * `ui.imageFrameTool` with the current mask shape — while armed, dragging on
 * the canvas rubber-bands a new {@link ImageSection} masked to that shape
 * (Canva-style image frame) that shows a drop zone until filled. The adjacent
 * dropdown switches the mask (rectangle / circle).
 *
 * Mutually exclusive with the shape, frame, and drawing tools. Press `Escape`
 * or pick the Select tool to disarm.
 */
export function ImageFrameToolButton({
    iconOnly = false,
    variant = 'caramel',
    activeVariant = 'orange',
    className,
    activeClassName,
}: ImageFrameToolButtonProps = {}) {
    const { ui, readOnly } = useEditor();
    const { imageFrameTool, setImageFrameTool, setShapeTool, setFrameTool, setDrawingMode } = ui;
    // Remember the last-picked mask so toggling the tool back on re-arms it.
    const [lastKind, setLastKind] = useState<ShapeKind>('rect');

    if (readOnly) return null;

    const armed = imageFrameTool !== null;
    const activeKind = imageFrameTool ?? lastKind;
    const { label } = MASK_KINDS.find((k) => k.value === activeKind) ?? MASK_KINDS[0];
    const toggleLabel = armed ? 'Cancel image frame' : `Image frame (${label.toLowerCase()})`;

    // Arming disarms every other draw tool — all are mutually exclusive.
    const disarmOthers = () => {
        setShapeTool(null);
        setFrameTool(false);
        setDrawingMode(false);
    };

    const toggle = () => {
        if (armed) {
            setImageFrameTool(null);
        } else {
            setImageFrameTool(activeKind);
            disarmOthers();
        }
    };

    const pick = (value: string) => {
        const kind = value as ShapeKind;
        setLastKind(kind);
        setImageFrameTool(kind);
        disarmOthers();
    };

    return (
        <div className={cn('flex items-center', iconOnly ? 'gap-0.5' : 'w-full gap-1')}>
            <Button
                variant={armed ? activeVariant : variant}
                size={iconOnly ? 'icon' : 'default'}
                aria-pressed={armed}
                aria-label={toggleLabel}
                title={toggleLabel}
                onClick={toggle}
                className={cn(
                    iconOnly ? 'h-9 w-9' : 'flex-1',
                    'image-frame-tool-button-click-trigger',
                    armed ? activeClassName : className,
                )}
                icon={iconOnly ? undefined : <ImagePlus className="h-4 w-4" />}
            >
                {iconOnly ? (
                    <>
                        <ImagePlus className="h-4 w-4" />
                        <span className="sr-only">{toggleLabel}</span>
                    </>
                ) : (
                    'Image frame'
                )}
            </Button>

            <Select value={activeKind} onValueChange={pick}>
                <SelectTrigger
                    aria-label="Choose image-frame shape"
                    title="Choose image-frame shape"
                    className={cn(
                        'w-6 justify-center border-0 bg-transparent px-0 shadow-none focus:ring-0',
                        'text-muted-foreground hover:text-foreground',
                    )}
                />
                <SelectContent align="start">
                    {MASK_KINDS.map(({ value, label: itemLabel, Icon: ItemIcon }) => (
                        <SelectItem key={value} value={value}>
                            <span className="flex items-center gap-2">
                                <ItemIcon className="h-4 w-4" />
                                {itemLabel}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
