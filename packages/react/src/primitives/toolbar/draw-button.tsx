'use client';

import { Pencil } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface DrawButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the idle (not-drawing) icon-only variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Override the active (drawing) icon-only variant. Defaults to `'orange'`. */
    activeVariant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button while idle. */
    className?: string;
    /** Extra classes merged onto the icon-only button while drawing is active. */
    activeClassName?: string;
}

/**
 * Toggles the editor between normal selection mode and freehand drawing
 * mode. While drawing mode is active the canvas captures pointer events as
 * strokes and the cursor switches to a crosshair.
 *
 * Mounted in the default toolbar. Clicking the button while drawing mode is
 * already on turns it back off — same as pressing `Escape`.
 */
export function DrawButton({
    iconOnly = false,
    variant = 'caramel',
    activeVariant = 'orange',
    className,
    activeClassName,
}: DrawButtonProps = {}) {
    const { ui, readOnly } = useEditor();
    const { drawingMode, setDrawingMode, setShapeTool } = ui;

    if (readOnly) return null;

    const label = drawingMode ? 'Stop Drawing' : 'Draw';

    // Arming drawing disarms the shape tool — the two modes are exclusive.
    const toggle = () => {
        const next = !drawingMode;
        setDrawingMode(next);
        if (next) setShapeTool(null);
    };

    if (iconOnly) {
        return (
            <Button
                variant={drawingMode ? activeVariant : variant}
                size="icon"
                aria-pressed={drawingMode}
                aria-label={label}
                title={label}
                onClick={toggle}
                className={cn(
                    'h-9 w-full',
                    'draw-button-click-trigger',
                    drawingMode ? activeClassName : className,
                )}
            >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{label}</span>
            </Button>
        );
    }

    return (
        <Button
            variant={drawingMode ? 'orange' : 'caramel'}
            aria-pressed={drawingMode}
            onClick={() => setDrawingMode(!drawingMode)}
            className={cn('w-full', 'draw-button-click-trigger')}
            icon={<Pencil className="h-4 w-4" />}
        >
            {label}
        </Button>
    );
}
