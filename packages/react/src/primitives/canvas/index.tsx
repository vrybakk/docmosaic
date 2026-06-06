'use client';

import { getPageDimensionsWithOrientation, type Section as SectionData } from '@docmosaic/core';
import { Children, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import {
    EditorCanvasProvider,
    EditorSectionProvider,
    useEditor,
} from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import Loader from '../../ui/loader';
import { Section } from '../image-section';
import { CanvasControls } from './canvas-controls';
import { useCanvasZoom } from './use-canvas-zoom';

interface CanvasProps {
    /**
     * Optional children rendered once per section as a template. Pass
     * `<Editor.Section />` (or a custom section component that consumes
     * {@link useEditorSection}) to control how each section is rendered.
     * Defaults to the built-in `<Section />` when omitted.
     */
    children?: ReactNode;
}

/**
 * Canvas primitive. Auto-fits the page to the available space, runs zoom
 * state, accepts section drops, and renders one section instance per
 * document section.
 *
 * Reads everything from {@link useEditor} — no state-related props. Each
 * section iteration wraps the children in {@link EditorSectionProvider}, so
 * the rendered child can call {@link useEditorSection} without an id.
 */
export function Canvas({ children }: CanvasProps = {}) {
    const editor = useEditor();
    const { state, ui, actions } = editor;
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
            drop: (item: { id: string; type: string }, monitor: DropTargetMonitor) => {
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
        [sections, finalScale, actions],
    );

    const combinedRef = (node: HTMLDivElement | null) => {
        if (node) dropRef(node);
    };

    if (!page || !pageDimensions || !pageDimensions.width || !pageDimensions.height) {
        return (
            <div className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-gray-500">Loading page...</div>
            </div>
        );
    }

    // Children is treated as a per-section template. If callers pass nothing
    // (or more than one child), fall back to the default Section primitive.
    const hasSingleChild = children !== undefined && Children.count(children) === 1;

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
                onClick={() => ui.setSelectedSectionId(null)}
                onWheel={handleWheel}
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
                            }}
                        >
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
                                                isSelected:
                                                    section.id === ui.selectedSectionId,
                                                finalScale,
                                            }}
                                        >
                                            {hasSingleChild ? children : <Section />}
                                        </EditorSectionProvider>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && <CanvasControls />}
            </div>
        </EditorCanvasProvider>
    );
}
