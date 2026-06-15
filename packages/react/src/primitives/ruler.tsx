'use client';

import { getPageDimensionsWithOrientation, ptToMm } from '@docmosaic/core';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useEditor, useEditorCanvas } from '../context/editor';
import { cn } from '../internal/utils';

/**
 * Thickness (CSS pixels) of each ruler band. Both the top and left ruler
 * occupy this many pixels of the canvas viewport — the page is shifted by
 * the same amount when rulers are visible so the page edge stays aligned
 * with the ruler's zero mark.
 */
export const RULER_THICKNESS = 24;

/** Display unit forwarded by `Editor.Root` for ruler tick labels. */
export type RulerUnit = 'pt' | 'mm' | 'in';

export interface RulerProps {
    /** Optional extra className applied to the outer container. */
    className?: string;
    /**
     * Override the display unit. Falls back to `display.rulerUnit` from the
     * editor context (defaults to `'pt'`).
     */
    unit?: RulerUnit;
}

/**
 * Convert a value in PDF points to the chosen display unit.
 *
 * @remarks
 * `'pt'` is the canonical storage unit so the conversion is the identity.
 * `'mm'` and `'in'` route through {@link ptToMm} so label maths stay
 * consistent with the rest of the editor.
 */
function ptToDisplay(pt: number, unit: RulerUnit): number {
    if (unit === 'pt') return pt;
    const mm = ptToMm(pt);
    return unit === 'mm' ? mm : mm / 25.4;
}

function formatLabel(value: number, unit: RulerUnit): string {
    if (unit === 'pt') return String(Math.round(value));
    // Two-decimal precision keeps mm/in labels readable without overflowing
    // the 50pt-spaced label slot at 100% zoom.
    return value.toFixed(value >= 100 ? 0 : 2);
}

/**
 * Ticks are sized in PDF points and converted to pixels by the caller via
 * `finalScale`. The minor tick lands every 10pt; majors and labels land
 * every 50pt — matching most print-tool conventions and giving readable
 * spacing at zoom levels from 0.25x through 4x.
 */
const MINOR_TICK_PT = 10;
const MAJOR_TICK_PT = 50;

/**
 * `Editor.Ruler` — top + left edge rulers showing PDF points (or mm/in) and
 * scaled with the canvas. Opt in via `<Editor.Root showRuler>` (auto-mounts
 * this primitive) or render manually inside `Editor.Canvas` for custom
 * placement.
 *
 * Tick spacing: minor every 10pt, major every 50pt. Tick coordinates ride
 * the canvas's `finalScale` so the labels stay readable from 25% through
 * 400% zoom.
 *
 * @example
 * ```tsx
 * <Editor.Root showRuler rulerUnit="mm">
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 * </Editor.Root>
 * ```
 */
export function Ruler({ className, unit: unitProp }: RulerProps = {}) {
    const { state, display } = useEditor();
    const { finalScale } = useEditorCanvas();
    const unit = unitProp ?? display.rulerUnit;

    const pageDimensions = useMemo(
        () => getPageDimensionsWithOrientation(state.pageSize, state.orientation),
        [state.pageSize, state.orientation],
    );

    // The page is centered in the scroll container and shifts with zoom, pan,
    // scroll, and sidebar collapse — none of which a fixed gutter or a single
    // ResizeObserver reliably tracks. Sync the tick origin to the page's real
    // position every frame, but only commit to state when it actually moves
    // (>0.5px) so static frames don't re-render.
    const rootRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState({ x: RULER_THICKNESS, y: RULER_THICKNESS });

    useLayoutEffect(() => {
        let raf = 0;
        let last = { x: Number.NaN, y: Number.NaN };
        const measure = () => {
            const root = rootRef.current;
            const page = document.querySelector('[data-page-container="true"]');
            if (root && page) {
                const r = root.getBoundingClientRect();
                const p = page.getBoundingClientRect();
                const x = p.left - r.left;
                const y = p.top - r.top;
                if (
                    !Number.isFinite(last.x) ||
                    Math.abs(x - last.x) > 0.5 ||
                    Math.abs(y - last.y) > 0.5
                ) {
                    last = { x, y };
                    setOrigin({ x, y });
                }
            }
        };
        measure();
        const loop = () => {
            measure();
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    if (!pageDimensions) return null;

    const widthPx = pageDimensions.width * finalScale;
    const heightPx = pageDimensions.height * finalScale;

    // Pre-compute the tick list once per render so the JSX stays a flat map.
    // The list goes 0 → page extent inclusive, so the final edge gets its
    // major mark even when the page width isn't a multiple of 50.
    const buildTicks = (extentPt: number) => {
        const ticks: { positionPx: number; major: boolean; label?: string }[] = [];
        for (let pt = 0; pt <= extentPt + 0.001; pt += MINOR_TICK_PT) {
            const isMajor = Math.abs(pt % MAJOR_TICK_PT) < 0.001;
            const tick: { positionPx: number; major: boolean; label?: string } = {
                positionPx: pt * finalScale,
                major: isMajor,
            };
            if (isMajor) {
                tick.label = formatLabel(ptToDisplay(pt, unit), unit);
            }
            ticks.push(tick);
        }
        return ticks;
    };

    const horizontalTicks = buildTicks(pageDimensions.width);
    const verticalTicks = buildTicks(pageDimensions.height);

    return (
        <div
            ref={rootRef}
            data-editor-ruler="true"
            // Clip to the canvas viewport so ticks/labels for the off-screen
            // part of the page (e.g. when zoomed in) never bleed over the
            // inspector or top bar.
            className={cn('pointer-events-none absolute inset-0 z-10 overflow-hidden', className)}
        >
            {/* Top ruler: horizontal band that mirrors the page's x extent.
                Sits above the page area; the canvas gutter (RULER_THICKNESS)
                reserves the space so this doesn't cover sections. */}
            <div
                data-editor-ruler-axis="horizontal"
                className="absolute top-0 left-0 right-0 bg-card text-foreground border-b border-border"
                style={{ height: RULER_THICKNESS }}
            >
                <div
                    className="relative h-full"
                    style={{
                        marginLeft: origin.x,
                        width: widthPx,
                    }}
                >
                    {horizontalTicks.map((tick, i) => (
                        <div
                            key={`h-${i}`}
                            data-tick={tick.major ? 'major' : 'minor'}
                            className="absolute top-0 bg-muted-foreground"
                            style={{
                                left: tick.positionPx,
                                width: 1,
                                height: tick.major ? RULER_THICKNESS / 2 : RULER_THICKNESS / 4,
                                bottom: 0,
                            }}
                        />
                    ))}
                    {horizontalTicks
                        .filter((t) => t.major && t.label !== undefined)
                        .map((tick, i) => (
                            <span
                                key={`hl-${i}`}
                                className="absolute text-[10px] text-muted-foreground select-none"
                                style={{
                                    left: tick.positionPx + 2,
                                    top: 2,
                                    lineHeight: 1,
                                }}
                            >
                                {tick.label}
                            </span>
                        ))}
                </div>
            </div>

            {/* Left ruler: vertical band that mirrors the page's y extent. */}
            <div
                data-editor-ruler-axis="vertical"
                className="absolute top-0 left-0 bottom-0 bg-card text-foreground border-r border-border"
                style={{ width: RULER_THICKNESS }}
            >
                <div
                    className="relative w-full"
                    style={{
                        marginTop: origin.y,
                        height: heightPx,
                    }}
                >
                    {verticalTicks.map((tick, i) => (
                        <div
                            key={`v-${i}`}
                            data-tick={tick.major ? 'major' : 'minor'}
                            className="absolute left-0 bg-muted-foreground"
                            style={{
                                top: tick.positionPx,
                                height: 1,
                                width: tick.major ? RULER_THICKNESS / 2 : RULER_THICKNESS / 4,
                                right: 0,
                            }}
                        />
                    ))}
                    {verticalTicks
                        .filter((t) => t.major && t.label !== undefined)
                        .map((tick, i) => (
                            <span
                                key={`vl-${i}`}
                                className="absolute text-[10px] text-muted-foreground select-none"
                                style={{
                                    top: tick.positionPx + 2,
                                    left: 2,
                                    lineHeight: 1,
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                }}
                            >
                                {tick.label}
                            </span>
                        ))}
                </div>
            </div>

            {/* Corner square hides the ruler-on-ruler crossover so the two
                bands look like one continuous L-shaped gutter. */}
            <div
                className="absolute top-0 left-0 bg-card border-r border-b border-border"
                style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
            />
        </div>
    );
}

// Marker recognised by `Editor.Canvas`. `Full` variant means the overlay
// positions itself absolutely against the canvas viewport instead of
// landing in the bottom-centered overlay slot used by `Editor.Zoom`.
(Ruler as unknown as { __editorCanvasOverlayFull: boolean }).__editorCanvasOverlayFull = true;
