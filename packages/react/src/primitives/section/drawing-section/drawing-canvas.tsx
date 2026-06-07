'use client';

import type { DrawingSection, Stroke } from '@docmosaic/core';
import { useCallback, useRef, useState } from 'react';
import { useEditor } from '../../../context/editor';

interface DrawingCanvasProps {
    section: DrawingSection;
    /** Display scale applied by Canvas (pageScale * zoom). */
    finalScale: number;
}

/**
 * Pointer-driven SVG drawing surface for a {@link DrawingSection}. Renders
 * every existing stroke and — while the editor is in `drawingMode` — captures
 * pointer events to author a new one.
 *
 * The capture lives on a transparent `<svg>` overlay sized to the section
 * box. Stroke points are stored in PDF-point space (the canvas conversion
 * divides by `finalScale` on commit) so the persisted document stays unit-
 * stable regardless of the viewport zoom.
 *
 * Strokes are committed on `pointerup` via the editor's `addStroke` action.
 * Points captured during the gesture are stored in local state so the
 * in-progress stroke renders smoothly without dispatching on every move.
 */
export function DrawingCanvas({ section, finalScale }: DrawingCanvasProps) {
    const { actions, ui } = useEditor();
    const { drawingMode, drawingColor, drawingWeight } = ui;
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
    const isDrawingRef = useRef(false);

    const toLocalPoint = useCallback((e: React.PointerEvent) => {
        const svg = svgRef.current;
        if (!svg) return null;
        const rect = svg.getBoundingClientRect();
        // Convert client coords to section-local CSS-pixel coords, then to PDF
        // points by dividing by finalScale.
        const xCss = e.clientX - rect.left;
        const yCss = e.clientY - rect.top;
        return { x: xCss / finalScale, y: yCss / finalScale };
    }, [finalScale]);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (!drawingMode) return;
            e.stopPropagation();
            const point = toLocalPoint(e);
            if (!point) return;
            isDrawingRef.current = true;
            setCurrentPoints([point]);
            // Some test environments (happy-dom) don't implement pointer
            // capture; guard so a missing implementation can't abort the gesture.
            try {
                (e.target as Element).setPointerCapture?.(e.pointerId);
            } catch {
                // capture not supported — pointer events still bubble normally
            }
        },
        [drawingMode, toLocalPoint],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!drawingMode || !isDrawingRef.current) return;
            const point = toLocalPoint(e);
            if (!point) return;
            setCurrentPoints((prev) => [...prev, point]);
        },
        [drawingMode, toLocalPoint],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!drawingMode || !isDrawingRef.current) return;
            isDrawingRef.current = false;
            // Offset the section-local PDF-point coords by the section's own
            // (x,y) so strokes live in page coords — matches what the PDF
            // generator consumes.
            const offsetPoints = currentPoints.map((p) => ({
                x: p.x + section.x,
                y: p.y + section.y,
            }));
            if (offsetPoints.length >= 2) {
                const stroke: Stroke = {
                    points: offsetPoints,
                    color: drawingColor,
                    weight: drawingWeight,
                };
                actions.addStroke(section.id, stroke);
            }
            setCurrentPoints([]);
            try {
                (e.target as Element).releasePointerCapture(e.pointerId);
            } catch {
                // releasePointerCapture throws if capture was never set; safe to ignore.
            }
        },
        [actions, currentPoints, drawingColor, drawingMode, drawingWeight, section.id, section.x, section.y],
    );

    // Render strokes in section-local coords by subtracting (section.x, section.y).
    const strokesLocal = section.strokes.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ x: p.x - section.x, y: p.y - section.y })),
    }));

    // Width/height in section-local PDF points; we scale via the SVG viewport.
    const widthPt = section.width;
    const heightPt = section.height;

    return (
        <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            data-drawing-canvas="true"
            width="100%"
            height="100%"
            viewBox={`0 0 ${widthPt} ${heightPt}`}
            preserveAspectRatio="none"
            style={{
                display: 'block',
                cursor: drawingMode ? 'crosshair' : 'default',
                // pointerEvents `auto` only while drawing so non-drawing
                // clicks pass through to the section shell (drag, select).
                pointerEvents: drawingMode ? 'auto' : 'none',
                touchAction: drawingMode ? 'none' : 'auto',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {strokesLocal.map((stroke, i) => (
                <polyline
                    key={i}
                    fill="none"
                    stroke={stroke.color}
                    strokeWidth={stroke.weight}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={stroke.points.map((p) => `${p.x},${p.y}`).join(' ')}
                />
            ))}
            {currentPoints.length > 1 && (
                <polyline
                    data-in-progress-stroke="true"
                    fill="none"
                    stroke={drawingColor}
                    strokeWidth={drawingWeight}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                />
            )}
        </svg>
    );
}
