'use client';

import Loader from '@/components/ui/data-display/loader';
import { trackEvent } from '@/lib/analytics';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { getPageDimensionsWithOrientation } from '@/lib/pdf-editor/utils/dimensions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { ImageSectionComponent } from '../image-section';
import { CanvasControls } from './canvas-controls';
import { useCanvasZoom } from './use-canvas-zoom';

interface CanvasProps {
    /** The current page data */
    page: Page;
    /** The page size (A4, etc.) */
    pageSize: PageSize;
    /** The page orientation */
    orientation: PageOrientation;
    /** All sections in the document */
    sections: ImageSection[];
    /** Currently selected section ID */
    selectedSectionId: string | null;
    /** Current page number */
    currentPage: number;
    /** Total number of pages in the document */
    totalPages: number;
    /** Callback when a section is selected */
    onSectionSelect: (sectionId: string | null) => void;
    /** Callback when a section is updated */
    onSectionUpdate: (section: ImageSection) => void;
    /** Callback when a section is duplicated */
    onSectionDuplicate: (section: ImageSection) => void;
    /** Callback when a section is deleted */
    onSectionDelete: (sectionId: string) => void;
    /** Callback when an image is uploaded to a section */
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    /** Callback when a new section is created */
    onSectionCreate?: (section: ImageSection) => void;
}

/**
 * Canvas component for PDF editor
 * Handles page display, zoom, and image section interactions
 */
export function Canvas({
    page,
    pageSize,
    orientation,
    sections,
    selectedSectionId,
    currentPage,
    onSectionSelect,
    onSectionUpdate,
    onSectionDuplicate,
    onSectionDelete,
    onImageUpload,
}: CanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const { zoom, minZoom, maxZoom, zoomIn, zoomOut, reset, handleWheel } = useCanvasZoom({
        onZoomChange: trackEvent.zoom,
    });

    const pageDimensions = useMemo(() => {
        return getPageDimensionsWithOrientation(pageSize, orientation);
    }, [pageSize, orientation]);

    // Auto-scale page to fit container
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

            setScale(newScale);
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

    // Filter sections for current page
    const pageSections = (sections || []).filter((section) => section.page === currentPage);
    const finalScale = (scale || 1) * (zoom || 1);

    // Handle section drag and drop with analytics
    const [, dropRef] = useDrop(
        () => ({
            accept: 'IMAGE_SECTION',
            drop: (item: { id: string; type: string }, monitor: DropTargetMonitor) => {
                const delta = monitor.getDifferenceFromInitialOffset();
                if (!delta) return;

                const section = sections.find((s) => s.id === item.id);
                if (section) {
                    trackEvent.dragSection();
                    onSectionUpdate({
                        ...section,
                        x: Math.round(section.x + delta.x / finalScale),
                        y: Math.round(section.y + delta.y / finalScale),
                    });
                }
            },
        }),
        [sections, finalScale, onSectionUpdate],
    );

    const combinedRef = (node: HTMLDivElement | null) => {
        if (node) dropRef(node);
    };

    // Safety check for required props
    if (!page || !pageDimensions || !pageDimensions.width || !pageDimensions.height) {
        return (
            <div className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-gray-500">Loading page...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 relative"
            onClick={() => onSectionSelect(null)}
            onWheel={handleWheel}
        >
            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex items-center justify-center min-h-full">
                    {/* Page container */}
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
                        {/* Background PDF */}
                        {page?.backgroundPDF && (
                            <div
                                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${page.backgroundPDF})` }}
                            />
                        )}

                        {/* Image sections */}
                        <div
                            className="absolute inset-0"
                            style={{
                                width: (pageDimensions?.width || 0) * finalScale,
                                height: (pageDimensions?.height || 0) * finalScale,
                            }}
                        >
                            {pageSections.map((section) => (
                                <ImageSectionComponent
                                    key={section.id}
                                    section={{
                                        ...section,
                                        x: section.x * finalScale,
                                        y: section.y * finalScale,
                                        width: section.width * finalScale,
                                        height: section.height * finalScale,
                                    }}
                                    isSelected={section.id === selectedSectionId}
                                    onUpdate={(updatedSection) => {
                                        onSectionUpdate({
                                            ...updatedSection,
                                            x: updatedSection.x / finalScale,
                                            y: updatedSection.y / finalScale,
                                            width: updatedSection.width / finalScale,
                                            height: updatedSection.height / finalScale,
                                        });
                                    }}
                                    onImageUpload={onImageUpload}
                                    onDuplicate={onSectionDuplicate}
                                    onDelete={onSectionDelete}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSectionSelect(section.id);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && (
                <CanvasControls
                    zoom={zoom}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onReset={handleResetZoom}
                />
            )}
        </div>
    );
}
