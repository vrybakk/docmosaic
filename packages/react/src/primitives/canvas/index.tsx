'use client';

import {
    getPageDimensionsWithOrientation,
    type Section as SectionData,
    type Stroke,
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
import {
    EditorCanvasProvider,
    EditorSectionProvider,
    useEditor,
} from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import Loader from '../../ui/loader';
import { Section } from '../section';
import { CanvasControls } from './canvas-controls';
import { SelectionBounds } from './selection-bounds';
import { SnapGuides } from './snap-guides';
import { bboxesIntersect } from './snap';
import { useCanvasZoom } from './use-canvas-zoom';

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
export function Canvas({ children, readOnly: readOnlyProp = false }: CanvasProps = {}) {
    const editor = useEditor();
    const { state, ui, actions } = editor;
    const readOnly = editor.readOnly || readOnlyProp;
    const { pageSize, orientation, sections, currentPage } = state;
    const page = state.pages[currentPage - 1];
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageScale, setPageScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const { zoom, minZoom, maxZoom, zoomIn, zoomOut, reset, handleWheel } = useCanvasZoom({
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
            const containerWidth = container.clientWidth - 48;
            const containerHeight = container.clientHeight - 48;

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
    }, [pageDimensions]);

    const handleResetZoom = () => {
        reset();
        setPan({ x: 0, y: 0 });
    };

    const pageSections = (sections || []).filter((s) => s.page === currentPage);
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
                if (section) {
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
    const [marquee, setMarquee] = useState<
        { startX: number; startY: number; x: number; y: number; width: number; height: number } | null
    >(null);
    const marqueeRef = useRef<typeof marquee>(null);
    const marqueeMovedRef = useRef(false);

    const handleCanvasPointerDown = (e: React.PointerEvent) => {
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
        marqueeRef.current = next;
        marqueeMovedRef.current = false;
        setMarquee(next);
    };

    const handleCanvasPointerMove = (e: React.PointerEvent) => {
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

    const handleCanvasPointerUp = () => {
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

    // Esc exits drawing mode. Scoped to the canvas surface (window listener)
    // so the keybinding works regardless of focus.
    useEffect(() => {
        if (!ui.drawingMode) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') ui.setDrawingMode(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ui]);

    // Pointer-driven drawing: in drawing mode, a pointerdown on the page
    // surface creates a fresh DrawingSection at the drag's start point and
    // accumulates points into a single stroke until pointerup. The section
    // grows to fit the drag bounding box on commit.
    const drawingDragRef = useRef<{
        sectionId: string;
        startX: number;
        startY: number;
        points: { x: number; y: number }[];
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    } | null>(null);

    const toPagePoint = (clientX: number, clientY: number) => {
        const node = pageRef.current;
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / finalScale,
            y: (clientY - rect.top) / finalScale,
        };
    };

    const handlePagePointerDown = (e: React.PointerEvent) => {
        if (readOnly) return;
        if (!ui.drawingMode) return;
        // Only react to clicks landing on the page surface itself — don't
        // hijack pointer events targeted at an existing section.
        if ((e.target as HTMLElement).closest('[data-section="true"]')) return;
        const start = toPagePoint(e.clientX, e.clientY);
        if (!start) return;
        e.stopPropagation();
        e.preventDefault();
        drawingDragRef.current = {
            sectionId: '',
            startX: start.x,
            startY: start.y,
            points: [start],
            minX: start.x,
            minY: start.y,
            maxX: start.x,
            maxY: start.y,
        };
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const handlePagePointerMove = (e: React.PointerEvent) => {
        if (readOnly) return;
        if (!ui.drawingMode) return;
        const drag = drawingDragRef.current;
        if (!drag) return;
        const pt = toPagePoint(e.clientX, e.clientY);
        if (!pt) return;
        drag.points.push(pt);
        drag.minX = Math.min(drag.minX, pt.x);
        drag.minY = Math.min(drag.minY, pt.y);
        drag.maxX = Math.max(drag.maxX, pt.x);
        drag.maxY = Math.max(drag.maxY, pt.y);
    };

    const handlePagePointerUp = (e: React.PointerEvent) => {
        if (readOnly) return;
        if (!ui.drawingMode) return;
        const drag = drawingDragRef.current;
        if (!drag) return;
        drawingDragRef.current = null;
        try {
            (e.target as Element).releasePointerCapture?.(e.pointerId);
        } catch {
            // capture may not have been set on this element
        }
        if (drag.points.length < 2) return;
        const pad = 4;
        const bbox = {
            x: drag.minX - pad,
            y: drag.minY - pad,
            width: Math.max(1, drag.maxX - drag.minX + pad * 2),
            height: Math.max(1, drag.maxY - drag.minY + pad * 2),
        };
        // Insert via addSection then immediately patch geometry + push the
        // stroke. Geometry is in PDF points (createSection treats x/y as px
        // and converts — we pre-multiply by 96/72 so the persisted value
        // lands at our desired point coordinate).
        const inserted = actions.addSection({ type: 'drawing' });
        actions.updateSection({
            ...inserted,
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
            page: currentPage,
        });
        const stroke: Stroke = {
            points: drag.points,
            color: ui.drawingColor,
            weight: ui.drawingWeight,
        };
        actions.addStroke(inserted.id, stroke);
    };

    if (!page || !pageDimensions || !pageDimensions.width || !pageDimensions.height) {
        return (
            <div className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-gray-500">Loading page...</div>
            </div>
        );
    }

    // Children are split into two buckets:
    //   - Overlay children (`Editor.Zoom` and any future canvas-bound widget
    //     that opts in via `__editorCanvasOverlay`) render once, anchored to
    //     the canvas viewport.
    //   - Everything else is treated as the per-section template — exactly one
    //     non-overlay child wins; pass none or multiple to fall back to the
    //     bundled `<Section />` primitive.
    const overlayChildren: ReactNode[] = [];
    const sectionTemplates: ReactNode[] = [];
    Children.forEach(children, (child) => {
        if (
            isValidElement(child) &&
            typeof child.type === 'function' &&
            (child.type as { __editorCanvasOverlay?: boolean }).__editorCanvasOverlay === true
        ) {
            overlayChildren.push(child);
            return;
        }
        sectionTemplates.push(child);
    });
    const sectionTemplate: ReactElement | null =
        sectionTemplates.length === 1 && isValidElement(sectionTemplates[0])
            ? (sectionTemplates[0] as ReactElement)
            : null;

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
                className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 relative"
                onClick={(e) => {
                    // In drawing mode the canvas owns pointer events for stroke
                    // capture — deselecting on click would feel out of place.
                    if (ui.drawingMode) return;
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
                onWheel={handleWheel}
                style={{ cursor: ui.drawingMode ? 'crosshair' : undefined }}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <div className="flex items-center justify-center min-h-full">
                        <div
                            ref={combinedRef}
                            data-page-container="true"
                            className="bg-white shadow-lg relative transition-transform duration-200 ease-out"
                            style={{
                                width: (pageDimensions?.width || 0) * finalScale,
                                height: (pageDimensions?.height || 0) * finalScale,
                                transform: `translate(${pan?.x || 0}px, ${pan?.y || 0}px)`,
                                touchAction: ui.drawingMode ? 'none' : undefined,
                            }}
                            onPointerDown={handlePagePointerDown}
                            onPointerMove={handlePagePointerMove}
                            onPointerUp={handlePagePointerUp}
                            onPointerCancel={handlePagePointerUp}
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
                                                isSelected: ui.selectedSectionIds.has(
                                                    section.id,
                                                ),
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
                                        className="absolute pointer-events-none border border-editor-accent bg-editor-accent/10"
                                        style={{
                                            left: marquee.x,
                                            top: marquee.y,
                                            width: marquee.width,
                                            height: marquee.height,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && <CanvasControls />}
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
