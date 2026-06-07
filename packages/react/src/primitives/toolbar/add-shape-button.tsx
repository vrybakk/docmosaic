'use client';

import type { ShapeKind } from '@docmosaic/core';
import { Circle, Minus, Square } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface AddShapeButtonProps {
    /** Which shape primitive to insert. Defaults to `'rect'`. */
    shape?: ShapeKind;
    /** Override the displayed label. Defaults to "Add Rectangle/Circle/Line". */
    label?: string;
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
export function AddShapeButton({ shape = 'rect', label }: AddShapeButtonProps = {}) {
    const { actions, readOnly } = useEditor();
    const { label: defaultLabel, Icon } = DEFAULTS[shape];

    if (readOnly) return null;

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
