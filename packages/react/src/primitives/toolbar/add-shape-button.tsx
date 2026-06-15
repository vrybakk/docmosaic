'use client';

import type { ShapeKind } from '@docmosaic/core';
import { Circle, Minus, Square } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button, type ButtonProps } from '../../ui/button';

interface AddShapeButtonProps {
    /** Which shape primitive to insert. Defaults to `'rect'`. */
    shape?: ShapeKind;
    /** Override the displayed label. Defaults to "Add Rectangle/Circle/Line". */
    label?: string;
    /** Render a compact icon-only square button with an accessible label. */
    iconOnly?: boolean;
    /** Override the icon-only button variant. Defaults to `'caramel'`. */
    variant?: ButtonProps['variant'];
    /** Extra classes merged onto the icon-only button. */
    className?: string;
}

const DEFAULTS: Record<ShapeKind, { label: string; Icon: typeof Square }> = {
    rect: { label: 'Add Rectangle', Icon: Square },
    circle: { label: 'Add Circle', Icon: Circle },
    line: { label: 'Add Line', Icon: Minus },
};

/**
 * Adds a new shape section to the current page. Calls
 * `actions.addSection({ type: 'shape', shape })` from context — which selects
 * the newly-created section and fires the analytics event.
 *
 * @remarks
 * Mounted three times by the default toolbar to expose Add Rectangle,
 * Add Circle, and Add Line as independent buttons. Pass `shape` to switch
 * variants; `label` to override the copy.
 */
export function AddShapeButton({
    shape = 'rect',
    label,
    iconOnly = false,
    variant = 'caramel',
    className,
}: AddShapeButtonProps = {}) {
    const { actions, readOnly } = useEditor();
    const { label: defaultLabel, Icon } = DEFAULTS[shape];

    if (readOnly) return null;

    if (iconOnly) {
        return (
            <Button
                variant={variant}
                size="icon"
                aria-label={label ?? defaultLabel}
                title={label ?? defaultLabel}
                onClick={() => {
                    actions.addSection({ type: 'shape', shape });
                }}
                className={cn('h-9 w-full', `add-shape-${shape}-button-click-trigger`, className)}
            >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label ?? defaultLabel}</span>
            </Button>
        );
    }

    return (
        <Button
            variant="caramel"
            onClick={() => {
                actions.addSection({ type: 'shape', shape });
            }}
            className={cn('w-full', `add-shape-${shape}-button-click-trigger`)}
            icon={<Icon className="h-4 w-4" />}
        >
            {label ?? defaultLabel}
        </Button>
    );
}
