'use client';

import type { ShapeKind } from '@docmosaic/core';
import { Circle, Minus, Square } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../ui/select';

interface ShapeToolButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the idle (not-armed) variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Override the armed (drawing) variant. Defaults to `'orange'`. */
    activeVariant?: ButtonProps['variant'];
    /** Extra classes merged onto the toggle button while idle. */
    className?: string;
    /** Extra classes merged onto the toggle button while the tool is armed. */
    activeClassName?: string;
}

const KINDS: { value: ShapeKind; label: string; Icon: typeof Square }[] = [
    { value: 'rect', label: 'Rectangle', Icon: Square },
    { value: 'circle', label: 'Circle', Icon: Circle },
    { value: 'line', label: 'Line', Icon: Minus },
];

/**
 * Draw-to-size shape tool. The toggle arms `ui.shapeTool` with the current
 * kind — while armed, dragging on the canvas rubber-bands a new shape at that
 * size instead of dropping a fixed box. The adjacent dropdown switches which
 * primitive the tool will create (and arms it with that kind).
 *
 * Mutually exclusive with freehand drawing: arming the shape tool turns
 * drawing mode off. Press `Escape` or pick the Select tool to disarm.
 */
export function ShapeToolButton({
    iconOnly = false,
    variant = 'caramel',
    activeVariant = 'orange',
    className,
    activeClassName,
}: ShapeToolButtonProps = {}) {
    const { ui, readOnly } = useEditor();
    const { shapeTool, setShapeTool, setDrawingMode, setFrameTool } = ui;
    // Remember the last-picked kind so toggling the tool back on re-arms the
    // same primitive even after it has been disarmed (where `shapeTool` is null).
    const [lastKind, setLastKind] = useState<ShapeKind>('rect');

    if (readOnly) return null;

    const armed = shapeTool !== null;
    const activeKind = shapeTool ?? lastKind;
    const { Icon, label } = KINDS.find((k) => k.value === activeKind) ?? KINDS[0];
    const toggleLabel = armed ? `Stop drawing ${label.toLowerCase()}` : `Draw ${label.toLowerCase()}`;

    const toggle = () => {
        if (armed) {
            setShapeTool(null);
        } else {
            setShapeTool(activeKind);
            setDrawingMode(false);
            setFrameTool(false);
        }
    };

    const pick = (value: string) => {
        const kind = value as ShapeKind;
        setLastKind(kind);
        setShapeTool(kind);
        setDrawingMode(false);
        setFrameTool(false);
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
                    'shape-tool-button-click-trigger',
                    armed ? activeClassName : className,
                )}
                icon={iconOnly ? undefined : <Icon className="h-4 w-4" />}
            >
                {iconOnly ? (
                    <>
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{toggleLabel}</span>
                    </>
                ) : (
                    'Shape'
                )}
            </Button>

            <Select value={activeKind} onValueChange={pick}>
                <SelectTrigger
                    aria-label="Choose shape type"
                    title="Choose shape type"
                    className={cn(
                        'w-6 justify-center border-0 bg-transparent px-0 shadow-none focus:ring-0',
                        'text-muted-foreground hover:text-foreground',
                    )}
                />
                <SelectContent align="start">
                    {KINDS.map(({ value, label: itemLabel, Icon: ItemIcon }) => (
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
