'use client';

import { MousePointer2 } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface SelectToolButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the idle icon-only variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Override the active (selection-mode) icon-only variant. Defaults to `'orange'`. */
    activeVariant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button while idle. */
    className?: string;
    /** Extra classes merged onto the icon-only button while selection mode is active. */
    activeClassName?: string;
}

/**
 * Cursor / select tool — the default editing mode. Active whenever drawing
 * mode is *off*; clicking it exits drawing mode. The counterpart to
 * {@link DrawButton}, sharing the same `ui.drawingMode` toggle so the two
 * read as a mutually-exclusive tool pair in the shell's tool palette.
 */
export function SelectToolButton({
    iconOnly = false,
    variant = 'caramel',
    activeVariant = 'orange',
    className,
    activeClassName,
}: SelectToolButtonProps = {}) {
    const { ui, readOnly } = useEditor();
    const { drawingMode, setDrawingMode } = ui;

    if (readOnly) return null;

    const active = !drawingMode;
    const label = 'Select';

    if (iconOnly) {
        return (
            <Button
                variant={active ? activeVariant : variant}
                size="icon"
                aria-pressed={active}
                aria-label={label}
                title={label}
                onClick={() => setDrawingMode(false)}
                className={cn(
                    'h-9 w-full',
                    'select-tool-button-click-trigger',
                    active ? activeClassName : className,
                )}
            >
                <MousePointer2 className="h-4 w-4" />
                <span className="sr-only">{label}</span>
            </Button>
        );
    }

    return (
        <Button
            variant={active ? activeVariant : variant}
            aria-pressed={active}
            onClick={() => setDrawingMode(false)}
            className={cn('w-full', 'select-tool-button-click-trigger', className)}
            icon={<MousePointer2 className="h-4 w-4" />}
        >
            {label}
        </Button>
    );
}
