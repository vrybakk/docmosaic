'use client';

import type { ShapeSection } from '@docmosaic/core';

interface SectionShapeProps {
    section: ShapeSection;
}

/**
 * SVG preview that mirrors the {@link drawShapeSection} render path in
 * `@docmosaic/core/pdf/generate`. Coordinates fill the section box so the
 * canvas matches the exported PDF.
 *
 * - `'rect'` → `<rect>` covering the box.
 * - `'circle'` → `<ellipse>` inscribed in the box.
 * - `'line'` → diagonal from top-left to bottom-right.
 */
export function SectionShape({ section }: SectionShapeProps) {
    const stroke = section.stroke ?? '#000';
    const strokeWidth = section.strokeWidth ?? 1;
    const fillRaw = section.fill ?? 'transparent';
    const fill = fillRaw === 'transparent' ? 'none' : fillRaw;
    const opacity = section.opacity ?? 1;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${section.width} ${section.height}`}
            preserveAspectRatio="none"
            style={{ opacity, display: 'block', pointerEvents: 'none' }}
            aria-hidden="true"
        >
            {section.shape === 'rect' && (
                <rect
                    x={strokeWidth / 2}
                    y={strokeWidth / 2}
                    width={Math.max(0, section.width - strokeWidth)}
                    height={Math.max(0, section.height - strokeWidth)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
            )}
            {section.shape === 'circle' && (
                <ellipse
                    cx={section.width / 2}
                    cy={section.height / 2}
                    rx={Math.max(0, section.width / 2 - strokeWidth / 2)}
                    ry={Math.max(0, section.height / 2 - strokeWidth / 2)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
            )}
            {section.shape === 'line' && (
                <line
                    x1={0}
                    y1={0}
                    x2={section.width}
                    y2={section.height}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
            )}
        </svg>
    );
}
