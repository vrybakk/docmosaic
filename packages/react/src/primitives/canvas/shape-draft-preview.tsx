'use client';

import type { ShapeKind } from '@docmosaic/core';

interface ShapeDraftPreviewProps {
    /** Which primitive the armed shape tool will create. */
    kind: ShapeKind;
    /** Draft box size in display pixels (used only for the SVG viewBox aspect). */
    width: number;
    height: number;
}

/**
 * Live preview drawn while the user drags out a new shape with the
 * draw-to-size tool. Mirrors {@link SectionShape}'s geometry (rect / inscribed
 * ellipse / corner-to-corner line) with a solid primary outline and a light
 * fill so the shape reads clearly *as it is being drawn*, not just on release.
 */
export function ShapeDraftPreview({ kind, width, height }: ShapeDraftPreviewProps) {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const common = {
        fill: 'currentColor',
        fillOpacity: 0.12,
        stroke: 'currentColor',
        strokeWidth: 2,
        vectorEffect: 'non-scaling-stroke' as const,
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            className="text-primary"
            style={{ display: 'block', pointerEvents: 'none' }}
            aria-hidden="true"
        >
            {kind === 'rect' && (
                <rect x={1} y={1} width={Math.max(0, w - 2)} height={Math.max(0, h - 2)} {...common} />
            )}
            {kind === 'circle' && (
                <ellipse
                    cx={w / 2}
                    cy={h / 2}
                    rx={Math.max(0, w / 2 - 1)}
                    ry={Math.max(0, h / 2 - 1)}
                    {...common}
                />
            )}
            {kind === 'line' && (
                <line
                    x1={0}
                    y1={0}
                    x2={w}
                    y2={h}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />
            )}
        </svg>
    );
}
