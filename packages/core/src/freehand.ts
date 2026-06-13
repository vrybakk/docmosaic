/**
 * Shared freehand-stroke smoothing, built on `perfect-freehand` — the same
 * engine Excalidraw and tldraw use. A freehand line is a *filled* shape whose
 * boundary is the variable-width envelope of the drawn centerline, not a
 * fixed-width polyline. Both the on-canvas renderer (`@docmosaic/react`) and
 * the PDF/PNG exporters call {@link getStrokeOutline} so screen and export
 * stay byte-for-glyph WYSIWYG.
 *
 * @packageDocumentation
 */

import { getStroke } from 'perfect-freehand';
import type { Point } from './types';

/**
 * Turn raw captured points into the smooth outline polygon for a stroke.
 *
 * @param points - Raw samples in PDF points (the stored source of truth).
 * @param weight - Stroke weight in PDF points; maps to the pen `size`.
 * @param complete - `true` once the stroke is committed (adds the end cap);
 *   `false` for the in-progress preview so the tail stays open under the pen.
 * @returns Outline polygon as `[x, y]` pairs, ready to fill (SVG path / jsPDF
 *   / canvas). Empty array for degenerate input.
 *
 * @remarks
 * `size` is tuned in PDF points (not Excalidraw's `strokeWidth * 4.25` px
 * unit) because geometry is already stored in points. `simulatePressure`
 * lets mouse velocity drive width (slower = thicker) for a natural pen feel.
 */
export function getStrokeOutline(points: Point[], weight: number, complete: boolean): number[][] {
    return getStroke(
        points.map((p) => [p.x, p.y]),
        {
            size: Math.max(1, weight) * 1.6,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
            easing: (t: number) => Math.sin((t * Math.PI) / 2),
            simulatePressure: true,
            last: complete,
            start: { cap: true, taper: 0 },
            end: { cap: true, taper: 0 },
        },
    );
}
