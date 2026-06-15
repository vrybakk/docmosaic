'use client';

import {
    getPageDimensionsWithOrientation,
    orderSectionsForRender,
    type Section as SectionData,
} from '@docmosaic/core';
import {
    Children,
    isValidElement,
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { EditorCanvasProvider, EditorSectionProvider, useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import Loader from '../../ui/loader';
import { Section } from '../section';
import { CanvasControls } from './canvas-controls';
import { SelectionBounds } from './selection-bounds';
import { ShapeDraftPreview } from './shape-draft-preview';
import { SnapGuides } from './snap-guides';
import { bboxesIntersect } from './snap';
import { useCanvasZoom } from './use-canvas-zoom';
import { Guides } from '../guides';
import { Minimap } from '../minimap';
import { Ruler, RULER_THICKNESS } from '../ruler';

export interface CanvasProps {
    /**
     * Two kinds of children are supported:
     *
     * 1. **Section template** — a single non-overlay child rendered once per
     *    section. Pass `<Editor.Section />` (or a custom section component
     *    that consumes {@link useEditorSection}) to control how each section
     *    is rendered. Defaults to the bundled `<Section />` when omitted.
     * 2. **Canvas overlays** — primitives that opt in via the
     *    `__editorCanvasOverlay` marker (e.g. {@link Editor.Zoom}). These are
     *    rendered once, anchored to the canvas viewport, and have access to
     *    {@link useEditorCanvas} via context. Any number can be supplied
     *    alongside the section template.
     */
    children?: ReactNode;
    /**
     * Force the canvas into read-only mode regardless of the root's
     * `readOnly` flag. Defaults to `false`. The effective read-only state is
     * `root.readOnly || canvas.readOnly` — either one is enough to suppress
     * drag, resize, drop, file upload, and section-toolbar buttons.
     *
     * Set automatically by {@link Editor.StaticCanvas}.
     */
    readOnly?: boolean;
    /**
     * Render the built-in top-right `CanvasControls` zoom strip. Defaults to
     * `true`. Set `false` when the surrounding layout supplies its own zoom
     * widget (e.g. the app-shell mounts a single bottom-center `Editor.Zoom`)
     * so there is exactly one zoom control on the canvas.
     */
    showControls?: boolean;
}

/**
 * Canvas primitive. Auto-fits the page to the available space, runs zoom
 * state, accepts section drops, and renders one section instance per
 * document section.
 *
 * Reads everything from {@link useEditor} — no state-related props. Each
 * section iteration wraps the children in {@link EditorSectionProvider}, so
 * the rendered child can call {@link useEditorSection} without an id.
 *
 * @param props.readOnly - When `true`, the canvas suppresses every mutating
 *   interaction (drag, resize, drop, file upload) even when the surrounding
 *   `Editor.Root` is editable. Selection and zoom stay live. Used by
 *   {@link Editor.StaticCanvas}.
 */
export function Canvas({
    children,
    readOnly: readOnlyProp = false,
    showControls = true,
}: CanvasProps = {}) {
    const editor = useEditor();
    const { state, ui, actions, display } = editor;
    const readOnly = editor.readOnly || readOnlyProp;
    const rulerGutter = display.showRuler ? RULER_THICKNESS : 0;
    const { pageSize, orientation, sections, currentPage } = state;
    const page = state.pages[currentPage - 1];
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageScale, setPageScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const { zoom, minZoom, maxZoom, zoomIn, zoomOut, setZoom, reset, handleWheel } = useCanvasZoom({
        onZoomChange: trackEvent.zoom,
    });

    const pageDimensions = useMemo(
        () => getPageDimensionsWithOrientation(pageSize, orientation),
        [pageSize, orientation],
    );

    useEffect(() => {
        if (!pageDimensions || !pageDimensions.width || !pageDimensions.height) return;

        setIsLoading(true);
        const updateScale = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            // Fit-to-view: reserve the `p-6` canvas padding (48px) plus the
            // ruler gutter (reserved once on top + left) so the page fits the
            // viewport on both axes — including the ruler — with comfortable
            // margin instead of overflowing past the fold.
            const containerWidth = container.clientWidth - 48 - rulerGutter;
            const containerHeight = container.clientHeight - 48 - rulerGutter;

            const scaleX = containerWidth / pageDimensions.width;
            const scaleY = containerHeight / pageDimensions.height;
            const newScale = Math.min(scaleX, scaleY);

            setPageScale(newScale);
            setPan({ x: 0, y: 0 });
            setTimeout(() => setIsLoading(false), 100);
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [pageDimensions, rulerGutter]);

    // Ctrl/⌘ + wheel (and trackpad pinch) zooms the canvas only. Attached
    // natively as a non-passive listener so `preventDefault` actually stops the
    // browser's page zoom — a React `onWheel` prop is passive and would not.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const handleResetZoom = () => {
        reset();
        setPan({ x: 0, y: 0 });
    };

    // Sections marked `hidden` are skipped on canvas, matching the PDF
    // generator. They keep their geometry and live in `state.sections` so
    // `Editor.LayerList` can still show them with a struck-through eye and
    // let the user toggle visibility back on. `orderSectionsForRender` mirrors
    // the PDF/PNG draw order — notably keeping container frames behind their
    // children — so the on-canvas stacking matches the export.
    const pageSections = orderSectionsForRender(
        (sections || []).filter((s) => s.page === currentPage && !s.hidden),
    );
    const finalScale = (pageScale || 1) * (zoom || 1);

    const [, dropRef] = useDrop(
        () => ({
            accept: 'IMAGE_SECTION',
            // In read-only mode the drop is a no-op so a stray drop event
            // never mutates the document.
            canDrop: () => !readOnly,
            drop: (item: { id: string; type: string }, monitor: DropTargetMonitor) => {
                if (readOnly) return;
                const delta = monitor.getDifferenceFromInitialOffset();
                if (!delta) return;

                const section = sections.find((s) => s.id === item.id);
                // Locked sections refuse drag-induced position changes —
                // matches the locked guard in `useEditorSection`'s readOnly
                // fold, which suppresses the drag hook itself.
                if (section && !section.locked) {
                    trackEvent.dragSection();
                    actions.updateSection({
                        ...section,
                        x: Math.round(section.x + delta.x / finalScale),
                        y: Math.round(section.y + delta.y / finalScale),
                    });
                }
            },
        }),
        [sections, finalScale, actions, readOnly],
    );

    const pageRef = useRef<HTMLDivElement | null>(null);
    const combinedRef = (node: HTMLDivElement | null) => {
        pageRef.current = node;
        if (node) dropRef(node);
    };

    // Marquee selection — pointerdown on the empty page surface starts a drag
    // box; on pointerup, any section whose PDF-points bbox intersects the
    // marquee becomes selected (replacing the previous selection). The
    // marquee is stored as page-relative display pixels so the overlay div
    // can render without re-doing the scale.
    const [marquee, setMarquee] = useState<{
        startX: number;
        startY: number;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const marqueeRef = useRef<typeof marquee>(null);
    const marqueeMovedRef = useRef(false);

    // Draw-to-size draft — when the shape OR container-frame tool is armed, a
    // pointer drag on the empty page rubber-bands a new box (same page-relative
    // display-pixel frame as the marquee) and creates the section on release.
    const [shapeDraft, setShapeDraft] = useState<typeof marquee>(null);
    const shapeDraftRef = useRef<typeof marquee>(null);
    const shapeDraftMovedRef = useRef(false);
    const drawToolActive = ui.shapeTool !== null || ui.frameTool || ui.imageFrameTool !== null;

    // Multi-touch pinch-zoom + two-finger pan. Tracked via the canvas's own
    // pointer events and gated on pointer count, so a mouse (always one pointer)
    // never enters this path — desktop behaviour is untouched. With a second
    // finger down we record the start distance/zoom/scroll and drive zoom from
    // the finger spread and pan from the midpoint movement.
    const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const pinchRef = useRef<{
        startDist: number;
        startZoom: number;
        startScrollLeft: number;
        startScrollTop: number;
        startMidX: number;
        startMidY: number;
    } | null>(null);

    const twoPointers = () => {
        const pts = [...activePointers.current.values()];
        return pts.length >= 2 ? [pts[0], pts[1]] : null;
    };

    const beginPinch = () => {
        const pair = twoPointers();
        const container = containerRef.current;
        if (!pair || !container) return;
        const [a, b] = pair;
        // Cancel any in-flight single-finger marquee / draw draft.
        marqueeRef.current = null;
        shapeDraftRef.current = null;
        setMarquee(null);
        setShapeDraft(null);
        pinchRef.current = {
            startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
            startZoom: zoom,
            startScrollLeft: container.scrollLeft,
            startScrollTop: container.scrollTop,
            startMidX: (a.x + b.x) / 2,
            startMidY: (a.y + b.y) / 2,
        };
    };

    const updatePinch = () => {
        const pair = twoPointers();
        const container = containerRef.current;
        const start = pinchRef.current;
        if (!pair || !container || !start) return;
        const [a, b] = pair;
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        setZoom(start.startZoom * (dist / start.startDist));
        container.scrollLeft = start.startScrollLeft - (midX - start.startMidX);
        container.scrollTop = start.startScrollTop - (midY - start.startMidY);
    };

    const handleCanvasPointerDown = (e: React.PointerEvent) => {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (activePointers.current.size >= 2) {
            beginPinch();
            return;
        }
        if (ui.drawingMode) return;
        // Only react when the press lands on the page surface (or canvas) —
        // not on an existing section / resize handle / control.
        const target = e.target as HTMLElement;
        if (target.closest('[data-section="true"]')) return;
        if (target.closest('[data-resize-handle="true"]')) return;
        if (target.closest('[data-selection-handle="true"]')) return;
        if (target.closest('[data-canvas-controls="true"]')) return;
        if (e.button !== 0) return;
        const node = pageRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const next = { startX: x, startY: y, x, y, width: 0, height: 0 };
        // An armed draw tool (shape or container frame) takes over the drag for
        // draw-to-size; marquee selection is suppressed while a box is placed.
        if (drawToolActive) {
            shapeDraftRef.current = next;
            shapeDraftMovedRef.current = false;
            setShapeDraft(next);
            return;
        }
        marqueeRef.current = next;
        marqueeMovedRef.current = false;
        setMarquee(next);
    };

    const handleCanvasPointerMove = (e: React.PointerEvent) => {
        if (activePointers.current.has(e.pointerId)) {
            activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }
        if (pinchRef.current) {
            updatePinch();
            return;
        }
        const draft = shapeDraftRef.current;
        if (draft) {
            const node = pageRef.current;
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const nx = Math.min(draft.startX, x);
            const ny = Math.min(draft.startY, y);
            const width = Math.abs(x - draft.startX);
            const height = Math.abs(y - draft.startY);
            if (width > 2 || height > 2) shapeDraftMovedRef.current = true;
            const nextDraft = { ...draft, x: nx, y: ny, width, height };
            shapeDraftRef.current = nextDraft;
            setShapeDraft(nextDraft);
            return;
        }
        const current = marqueeRef.current;
        if (!current) return;
        const node = pageRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const nx = Math.min(current.startX, x);
        const ny = Math.min(current.startY, y);
        const width = Math.abs(x - current.startX);
        const height = Math.abs(y - current.startY);
        if (width > 2 || height > 2) marqueeMovedRef.current = true;
        const next = { ...current, x: nx, y: ny, width, height };
        marqueeRef.current = next;
        setMarquee(next);
    };

    const handleCanvasPointerUp = (e: React.PointerEvent) => {
        activePointers.current.delete(e.pointerId);
        if (pinchRef.current) {
            // A finger lifted during a pinch — end the gesture. No marquee/draft
            // runs during a pinch, and the still-down finger won't start one
            // (that only happens on pointerdown), so just clear and bail.
            if (activePointers.current.size < 2) pinchRef.current = null;
            return;
        }
        const draft = shapeDraftRef.current;
        if (draft) {
            shapeDraftRef.current = null;
            const moved = shapeDraftMovedRef.current;
            shapeDraftMovedRef.current = false;
            setShapeDraft(null);
            // A negligible drag (just a click) leaves the tool armed without
            // spawning a zero-size section.
            if (moved) {
                const rect = {
                    x: Math.round(draft.x / finalScale),
                    y: Math.round(draft.y / finalScale),
                    width: Math.max(1, Math.round(draft.width / finalScale)),
                    height: Math.max(1, Math.round(draft.height / finalScale)),
                };
                if (ui.shapeTool) {
                    actions.addSection({ type: 'shape', shape: ui.shapeTool, rect });
                } else if (ui.frameTool) {
                    actions.addSection({ type: 'frame', rect });
                } else if (ui.imageFrameTool) {
                    actions.addSection({ type: 'image', maskShape: ui.imageFrameTool, rect });
                }
            }
            return;
        }
        const current = marqueeRef.current;
        if (!current) return;
        marqueeRef.current = null;
        if (!marqueeMovedRef.current) {
            // No drag — let the click handler clear selection instead.
            setMarquee(null);
            return;
        }
        // Convert marquee (display px relative to page) to PDF-points and
        // intersect with each section's bbox.
        const marqueeBox = {
            x: current.x / finalScale,
            y: current.y / finalScale,
            width: current.width / finalScale,
            height: current.height / finalScale,
        };
        const hits: string[] = [];
        for (const s of pageSections) {
            if (
                bboxesIntersect(marqueeBox, {
                    x: s.x,
                    y: s.y,
                    width: s.width,
                    height: s.height,
                })
            ) {
                hits.push(s.id);
            }
        }
        ui.selectMany(hits);
        setMarquee(null);
    };

    // Esc exits drawing mode or any armed draw tool (shape / frame). Scoped to
    // the canvas surface (window listener) so it works regardless of focus.
    useEffect(() => {
        if (!ui.drawingMode && !ui.shapeTool && !ui.frameTool && !ui.imageFrameTool) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                ui.setDrawingMode(false);
                ui.setShapeTool(null);
                ui.setFrameTool(false);
                ui.setImageFrameTool(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ui]);

    // Freehand drawing layer: while the pen is armed, ensure a single
    // page-spanning DrawingSection exists for the current page. Its
    // DrawingCanvas (sized to the whole page, origin 0,0 so section-local
    // points equal page points) captures smooth strokes anywhere — no
    // box-per-stroke. Created on enter; removed again on exit if nothing was
    // drawn, so toggling the pen leaves no empty layers behind.
    useEffect(() => {
        if (readOnly || !ui.drawingMode || !pageDimensions) return;
        if (sections.some((s) => s.page === currentPage && s.type === 'drawing')) return;
        const inserted = actions.addSection({ type: 'drawing' });
        actions.updateSection({
            ...inserted,
            x: 0,
            y: 0,
            width: pageDimensions.width,
            height: pageDimensions.height,
            page: currentPage,
        });
    }, [ui.drawingMode, readOnly, currentPage, pageDimensions, sections, actions]);

    const wasDrawingRef = useRef(false);
    useEffect(() => {
        if (wasDrawingRef.current && !ui.drawingMode) {
            const empty = sections.find(
                (s) => s.page === currentPage && s.type === 'drawing' && s.strokes.length === 0,
            );
            if (empty) actions.deleteSection(empty.id);
        }
        wasDrawingRef.current = ui.drawingMode;
    }, [ui.drawingMode, currentPage, sections, actions]);

    if (!page || !pageDimensions || !pageDimensions.width || !pageDimensions.height) {
        return (
            <div className="flex-1 min-h-0 overflow-auto bg-muted p-6 flex items-center justify-center">
                <div className="text-muted-foreground">Loading page...</div>
            </div>
        );
    }

    // Children are split into three buckets:
    //   - Centered overlays (`Editor.Zoom`) tagged with
    //     `__editorCanvasOverlay`. Rendered once in the bottom-centered slot.
    //   - Full-viewport overlays (`Editor.Ruler`, `Editor.Guides`,
    //     `Editor.Minimap`) tagged with `__editorCanvasOverlayFull`. Each
    //     positions itself absolutely against the canvas viewport.
    //   - Everything else is treated as the per-section template — exactly one
    //     non-overlay child wins; pass none or multiple to fall back to the
    //     bundled `<Section />` primitive.
    const overlayChildren: ReactNode[] = [];
    const fullOverlayChildren: ReactNode[] = [];
    const sectionTemplates: ReactNode[] = [];
    Children.forEach(children, (child) => {
        if (isValidElement(child) && typeof child.type === 'function') {
            const tags = child.type as {
                __editorCanvasOverlay?: boolean;
                __editorCanvasOverlayFull?: boolean;
            };
            if (tags.__editorCanvasOverlayFull === true) {
                fullOverlayChildren.push(child);
                return;
            }
            if (tags.__editorCanvasOverlay === true) {
                overlayChildren.push(child);
                return;
            }
        }
        sectionTemplates.push(child);
    });
    const sectionTemplate: ReactElement | null =
        sectionTemplates.length === 1 && isValidElement(sectionTemplates[0])
            ? (sectionTemplates[0] as ReactElement)
            : null;

    // Auto-mount opt-in polish overlays when the corresponding `Editor.Root`
    // flag is on. Manual renders still win — the check below only injects a
    // primitive when the consumer didn't already supply one.
    const hasRulerChild = fullOverlayChildren.some((c) => isValidElement(c) && c.type === Ruler);
    const hasGuidesChild = fullOverlayChildren.some((c) => isValidElement(c) && c.type === Guides);
    const hasMinimapChild = fullOverlayChildren.some(
        (c) => isValidElement(c) && c.type === Minimap,
    );
    if (display.showRuler && !hasRulerChild) {
        fullOverlayChildren.push(<Ruler key="__auto-ruler" />);
    }
    if (display.showRuler && !hasGuidesChild) {
        fullOverlayChildren.push(<Guides key="__auto-guides" />);
    }
    if (display.showMinimap && !hasMinimapChild) {
        fullOverlayChildren.push(<Minimap key="__auto-minimap" />);
    }

    return (
        <EditorCanvasProvider
            value={{
                pageScale,
                zoom,
                minZoom,
                maxZoom,
                finalScale,
                zoomIn,
                zoomOut,
                reset: handleResetZoom,
            }}
        >
            <div
                ref={containerRef}
                className="flex-1 min-h-0 overflow-auto overscroll-contain touch-none bg-muted p-6 relative"
                onClick={(e) => {
                    // In drawing mode the canvas owns pointer events for stroke
                    // capture — deselecting on click would feel out of place.
                    // The armed shape tool likewise keeps its just-placed shape
                    // selected instead of clearing it on the trailing click.
                    if (ui.drawingMode || drawToolActive) return;
                    // Ignore clicks that fired at the tail of a marquee drag;
                    // the marquee already updated the selection.
                    if (marqueeMovedRef.current) {
                        marqueeMovedRef.current = false;
                        return;
                    }
                    const target = e.target as HTMLElement;
                    if (target.closest('[data-section="true"]')) return;
                    ui.clearSelection();
                }}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                style={{ cursor: ui.drawingMode || drawToolActive ? 'crosshair' : undefined }}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <div
                        className="flex items-center justify-center min-h-full"
                        style={{ paddingLeft: rulerGutter, paddingTop: rulerGutter }}
                    >
                        <div
                            ref={combinedRef}
                            data-page-container="true"
                            className="bg-white shadow-lg relative transition-transform duration-200 ease-out"
                            style={{
                                width: (pageDimensions?.width || 0) * finalScale,
                                height: (pageDimensions?.height || 0) * finalScale,
                                transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px)`,
                                touchAction: ui.drawingMode || drawToolActive ? 'none' : undefined,
                            }}
                        >
                            {/* Page.background — color first, then image — mirrors
                                the PDF generator's draw order so the canvas
                                preview matches export. */}
                            {page?.background?.color && (
                                <div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: page.background.color }}
                                />
                            )}
                            {page?.background?.image && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${page.background.image})` }}
                                />
                            )}
                            {page?.backgroundPDF && (
                                <div
                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${page.backgroundPDF})` }}
                                />
                            )}

                            <div
                                className="absolute inset-0"
                                style={{
                                    width: (pageDimensions?.width || 0) * finalScale,
                                    height: (pageDimensions?.height || 0) * finalScale,
                                }}
                            >
                                {pageSections.map((section: SectionData) => {
                                    const scaledSection: SectionData = {
                                        ...section,
                                        x: section.x * finalScale,
                                        y: section.y * finalScale,
                                        width: section.width * finalScale,
                                        height: section.height * finalScale,
                                    };
                                    return (
                                        <EditorSectionProvider
                                            key={section.id}
                                            value={{
                                                section: scaledSection,
                                                rawSection: section,
                                                isSelected: ui.selectedSectionIds.has(section.id),
                                                finalScale,
                                                readOnly,
                                            }}
                                        >
                                            {sectionTemplate ?? <Section />}
                                        </EditorSectionProvider>
                                    );
                                })}

                                {ui.selectedSectionIds.size > 1 && (
                                    <SelectionBounds
                                        sections={pageSections}
                                        selectedIds={ui.selectedSectionIds}
                                        finalScale={finalScale}
                                        pageDimensions={pageDimensions}
                                    />
                                )}

                                <SnapGuides
                                    guides={ui.activeSnapGuides}
                                    pageDimensions={pageDimensions}
                                    finalScale={finalScale}
                                />

                                {marquee && (
                                    <div
                                        data-marquee="true"
                                        className="absolute pointer-events-none border border-primary bg-primary/10"
                                        style={{
                                            left: marquee.x,
                                            top: marquee.y,
                                            width: marquee.width,
                                            height: marquee.height,
                                        }}
                                    />
                                )}

                                {shapeDraft && drawToolActive && (
                                    <div
                                        data-shape-draft="true"
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: shapeDraft.x,
                                            top: shapeDraft.y,
                                            width: shapeDraft.width,
                                            height: shapeDraft.height,
                                        }}
                                    >
                                        {ui.shapeTool || ui.imageFrameTool ? (
                                            <ShapeDraftPreview
                                                kind={ui.shapeTool ?? ui.imageFrameTool!}
                                                width={shapeDraft.width}
                                                height={shapeDraft.height}
                                            />
                                        ) : (
                                            <div className="h-full w-full rounded-md border-2 border-dashed border-primary bg-primary/5" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && showControls && <CanvasControls />}
                {!isLoading && fullOverlayChildren.length > 0 && (
                    <div
                        data-canvas-overlay-layer="true"
                        className="absolute inset-0 pointer-events-none z-10"
                    >
                        {fullOverlayChildren}
                    </div>
                )}
                {!isLoading && overlayChildren.length > 0 && (
                    <div
                        data-canvas-overlay-slot="true"
                        className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-10"
                    >
                        <div className="pointer-events-auto">{overlayChildren}</div>
                    </div>
                )}
            </div>
        </EditorCanvasProvider>
    );
}
