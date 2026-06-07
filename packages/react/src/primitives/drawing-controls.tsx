'use client';

import { useEditor } from '../context/editor';
import { cn } from '../internal/utils';
import { Button } from '../ui/button';
import { BrushWeightSlider } from './brush-weight-slider';
import { ColorPicker } from './color-picker';

interface DrawingControlsProps {
    className?: string;
}

/**
 * Composed drawing-mode side panel. Pairs {@link ColorPicker} +
 * {@link BrushWeightSlider} with "Clear" and "Done" actions so a user can
 * pick their ink, pick their thickness, wipe the selected drawing, or exit
 * drawing mode without having to assemble the surface themselves.
 *
 * Reads `ui.drawingColor` / `ui.drawingWeight` / `ui.selectedSectionId` from
 * the editor context; "Clear" calls `actions.clearStrokes`; "Done" turns
 * drawing mode off.
 */
export function DrawingControls({ className }: DrawingControlsProps) {
    const { state, ui, actions } = useEditor();
    const { drawingColor, drawingWeight, drawingMode, selectedSectionId } = ui;

    const selected = selectedSectionId
        ? state.sections.find((s) => s.id === selectedSectionId)
        : undefined;
    const canClear = selected?.type === 'drawing' && selected.strokes.length > 0;

    return (
        <div
            data-drawing-controls="true"
            className={cn(
                'flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm',
                className,
            )}
        >
            <ColorPicker value={drawingColor} onChange={ui.setDrawingColor} />
            <BrushWeightSlider
                value={drawingWeight}
                onChange={ui.setDrawingWeight}
                previewColor={drawingColor}
            />
            <div className="flex items-center gap-2">
                <Button
                    variant="white"
                    size="sm"
                    disabled={!canClear}
                    onClick={() => {
                        if (selectedSectionId) actions.clearStrokes(selectedSectionId);
                    }}
                    className="flex-1"
                >
                    Clear
                </Button>
                <Button
                    variant="caramel"
                    size="sm"
                    onClick={() => ui.setDrawingMode(false)}
                    disabled={!drawingMode}
                    className="flex-1"
                >
                    Done
                </Button>
            </div>
        </div>
    );
}
