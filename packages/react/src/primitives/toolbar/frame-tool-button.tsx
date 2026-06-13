'use client';

import { Frame } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface FrameToolButtonProps {
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the idle (tool-off) icon-only variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Override the active (tool-armed) icon-only variant. Defaults to `'orange'`. */
    activeVariant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button while idle. */
    className?: string;
    /** Extra classes merged onto the icon-only button while the tool is armed. */
    activeClassName?: string;
}

/**
 * Arms the container-frame draw-to-size tool. While armed, dragging on the
 * empty page rubber-bands a new {@link FrameSection}; clicking the button again
 * (or pressing `Escape`) disarms it. Mutually exclusive with the drawing and
 * shape tools.
 */
export function FrameToolButton({
    iconOnly = false,
    variant = 'caramel',
    activeVariant = 'orange',
    className,
    activeClassName,
}: FrameToolButtonProps = {}) {
    const { ui, readOnly } = useEditor();
    const { frameTool, setFrameTool, setDrawingMode, setShapeTool } = ui;

    if (readOnly) return null;

    const label = frameTool ? 'Cancel Frame' : 'Frame';

    // Arming the frame tool disarms drawing + the shape tool — all draw tools
    // are mutually exclusive.
    const toggle = () => {
        const next = !frameTool;
        setFrameTool(next);
        if (next) {
            setDrawingMode(false);
            setShapeTool(null);
        }
    };

    if (iconOnly) {
        return (
            <Button
                variant={frameTool ? activeVariant : variant}
                size="icon"
                aria-pressed={frameTool}
                aria-label={label}
                title={label}
                onClick={toggle}
                className={cn('h-9 w-full', frameTool ? activeClassName : className)}
            >
                <Frame className="h-4 w-4" />
                <span className="sr-only">{label}</span>
            </Button>
        );
    }

    return (
        <Button
            variant={frameTool ? 'orange' : 'caramel'}
            aria-pressed={frameTool}
            onClick={toggle}
            className="w-full"
            icon={<Frame className="h-4 w-4" />}
        >
            {label}
        </Button>
    );
}
