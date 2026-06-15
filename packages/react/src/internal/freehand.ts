import { getStrokeOutline, type Point } from '@docmosaic/core';

/**
 * Turn a perfect-freehand outline polygon into an SVG path `d`. This is the
 * canonical `getSvgPathFromStroke` helper from the perfect-freehand README —
 * the package doesn't export it, so it's inlined. It draws quadratic Béziers
 * between the midpoints of consecutive outline points (with the points as
 * control points) and closes the path, which is what makes the filled
 * boundary look smooth.
 */
function getSvgPathFromStroke(points: number[][]): string {
    const len = points.length;
    if (len < 4) return '';
    const average = (a: number, b: number) => (a + b) / 2;
    let a = points[0];
    let b = points[1];
    const c = points[2];
    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(
        2,
    )} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
    for (let i = 2, max = len - 1; i < max; i++) {
        a = points[i];
        b = points[i + 1];
        result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }
    result += 'Z';
    return result;
}

/**
 * Build the filled SVG path for a freehand stroke from its raw points. Shares
 * the `getStrokeOutline` engine with the PDF/PNG exporters so the on-canvas
 * ink matches the export exactly.
 */
export function getStrokePath(points: Point[], weight: number, complete: boolean): string {
    return getSvgPathFromStroke(getStrokeOutline(points, weight, complete));
}
