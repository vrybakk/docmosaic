'use client';

import type { SnapGuide } from '../../context/editor';

interface SnapGuidesProps {
    guides: SnapGuide[];
    pageDimensions: { width: number; height: number };
    finalScale: number;
}

/**
 * Render the active snap guides — one absolutely-positioned div per matched
 * candidate. Vertical guides span the page height, horizontal ones span the
 * page width. Pointer-events are disabled so the lines never steal a click
 * from the section underneath.
 *
 * Phase 16. The guides are emitted by the group-drag handler in
 * {@link useEditorSection}; this primitive just paints them.
 */
export function SnapGuides({ guides, pageDimensions, finalScale }: SnapGuidesProps) {
    if (guides.length === 0) return null;
    const pageWidth = pageDimensions.width * finalScale;
    const pageHeight = pageDimensions.height * finalScale;
    return (
        <>
            {guides.map((g, i) => {
                const key = `${g.orientation}-${g.position}-${i}`;
                if (g.orientation === 'vertical') {
                    return (
                        <div
                            key={key}
                            data-snap-guide="vertical"
                            className="absolute pointer-events-none bg-editor-accent"
                            style={{
                                left: g.position,
                                top: 0,
                                width: 1,
                                height: pageHeight,
                            }}
                        />
                    );
                }
                return (
                    <div
                        key={key}
                        data-snap-guide="horizontal"
                        className="absolute pointer-events-none bg-editor-accent"
                        style={{
                            left: 0,
                            top: g.position,
                            width: pageWidth,
                            height: 1,
                        }}
                    />
                );
            })}
        </>
    );
}
