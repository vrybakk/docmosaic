'use client';

import { Pencil } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

/**
 * Toggles the editor between normal selection mode and freehand drawing
 * mode. While drawing mode is active the canvas captures pointer events as
 * strokes and the cursor switches to a crosshair.
 *
 * Mounted in the default toolbar. Clicking the button while drawing mode is
 * already on turns it back off — same as pressing `Escape`.
 */
export function DrawButton() {
    const { ui, readOnly } = useEditor();
    const { drawingMode, setDrawingMode } = ui;

    if (readOnly) return null;

    return (
        <Button
            variant={drawingMode ? 'orange' : 'caramel'}
            aria-pressed={drawingMode}
            onClick={() => setDrawingMode(!drawingMode)}
            className={cn('w-full', 'draw-button-click-trigger')}
            icon={<Pencil className="h-4 w-4" />}
        >
            {drawingMode ? 'Stop Drawing' : 'Draw'}
        </Button>
    );
}
