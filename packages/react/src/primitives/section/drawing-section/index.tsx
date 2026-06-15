'use client';

import type { DrawingSection as DrawingSectionData } from '@docmosaic/core';
import { useEditorSection } from '../../../context/editor';
import { DrawingCanvas } from './drawing-canvas';

/**
 * Drawing-variant section view — a bare, page-spanning ink layer rather than a
 * boxed/resizable section. The {@link DrawingCanvas} captures smooth freehand
 * strokes anywhere on the page while the pen is armed (`ui.drawingMode`) and
 * renders the committed strokes.
 *
 * The wrapper is `pointer-events-none` so it never blocks selecting the
 * sections beneath it; the canvas flips its own pointer events on only while
 * drawing. There is no selection box, drag, or resize — the drawing is a fixed
 * full-page layer, managed through `Editor.LayerList` (visibility / lock).
 */
export function DrawingSectionView() {
    const editor = useEditorSection();
    const section = editor.section as DrawingSectionData;
    const rawSection = editor.rawSection as DrawingSectionData;
    const { finalScale } = editor;

    return (
        <div
            data-section="true"
            data-section-id={section.id}
            data-section-type="drawing"
            className="absolute pointer-events-none"
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                zIndex: section.zIndex ?? 0,
            }}
        >
            <DrawingCanvas section={rawSection} finalScale={finalScale} />
        </div>
    );
}
