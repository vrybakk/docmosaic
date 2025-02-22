'use client';

import { Button } from '@/components/ui/button';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { getPageDimensionsWithOrientation } from '@/lib/pdf-editor/utils/dimensions';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { ImageSectionComponent } from '../image-section';

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

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const PINCH_THRESHOLD = 10;

/**
 * Canvas component for the PDF editor
 * Displays the current page with its image sections
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
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);
    const pageDimensions = getPageDimensionsWithOrientation(pageSize, orientation);

    // Calculate base scale based on container size
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const containerWidth = container.clientWidth - 48; // Account for padding
            const containerHeight = container.clientHeight - 48;

            // Calculate scale to fit the page within the container
            const scaleX = containerWidth / pageDimensions.width;
            const scaleY = containerHeight / pageDimensions.height;
            // Remove the cap at 1 to allow proper scaling
            const newScale = Math.min(scaleX, scaleY);

            setScale(newScale);
            // Reset pan when scale changes
            setPan({ x: 0, y: 0 });
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [pageDimensions.width, pageDimensions.height]);

    // Handle zoom in
    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    };

    // Handle zoom out
    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    };

    // Handle zoom reset
    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Handle wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
        }
    };

    // Trigger haptic feedback
    const triggerHaptic = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };

    // Calculate distance between two touch points
    const getTouchDistance = (touches: React.TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Get center point between two touches
    const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
        if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
        };
    };

    // Handle touch events for pan and pinch zoom
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Pinch gesture start
            e.preventDefault();
            touchStartRef.current = {
                x: getTouchCenter(e.touches).x,
                y: getTouchCenter(e.touches).y,
                distance: getTouchDistance(e.touches),
            };
            triggerHaptic();
        } else if (e.touches.length === 1) {
            // Single touch for pan
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        if (e.touches.length === 2 && touchStartRef.current.distance !== undefined) {
            // Handle pinch zoom
            e.preventDefault(); // Prevent default zoom behavior
            const newDistance = getTouchDistance(e.touches);
            const distanceDelta = newDistance - touchStartRef.current.distance;

            if (Math.abs(distanceDelta) > PINCH_THRESHOLD) {
                const zoomDelta = (distanceDelta / touchStartRef.current.distance) * 0.5;
                setZoom((prev) => Math.min(Math.max(prev + zoomDelta, MIN_ZOOM), MAX_ZOOM));
                touchStartRef.current.distance = newDistance;
                triggerHaptic();
            }
        } else if (e.touches.length === 1) {
            // Handle pan
            const deltaX = e.touches[0].clientX - touchStartRef.current.x;
            const deltaY = e.touches[0].clientY - touchStartRef.current.y;

            setPan((prev) => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY,
            }));

            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = null;
    };

    // Filter sections for current page
    const pageSections = sections.filter((section) => section.page === currentPage);

    // Calculate final scale including zoom
    const finalScale = scale * zoom;

    // Handle section drop
    const [, dropRef] = useDrop(
        () => ({
            accept: 'IMAGE_SECTION',
            drop: (item: { id: string; type: string }, monitor: DropTargetMonitor) => {
                const delta = monitor.getDifferenceFromInitialOffset();
                if (!delta) return;

                const section = sections.find((s) => s.id === item.id);
                if (section) {
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
        if (node) {
            dropRef(node);
        }
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 min-h-0 overflow-auto bg-gray-100 p-6 relative"
            onClick={() => onSectionSelect(null)}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="flex items-center justify-center min-h-full">
                {/* Page container */}
                <div
                    ref={combinedRef}
                    className="bg-white shadow-lg relative transition-transform duration-200 ease-out"
                    style={{
                        width: pageDimensions.width * finalScale,
                        height: pageDimensions.height * finalScale,
                        transform: `translate(${pan.x}px, ${pan.y}px)`,
                    }}
                >
                    {/* Background PDF if available */}
                    {page.backgroundPDF && (
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${page.backgroundPDF})` }}
                        />
                    )}

                    {/* Sections container with scaling */}
                    <div
                        className="absolute inset-0"
                        style={{
                            width: pageDimensions.width * finalScale,
                            height: pageDimensions.height * finalScale,
                        }}
                    >
                        {pageSections.map((section) => (
                            <ImageSectionComponent
                                key={section.id}
                                section={{
                                    ...section,
                                    // Apply final scale only for display
                                    x: section.x * finalScale,
                                    y: section.y * finalScale,
                                    width: section.width * finalScale,
                                    height: section.height * finalScale,
                                }}
                                isSelected={section.id === selectedSectionId}
                                onUpdate={(updatedSection) => {
                                    // Scale back all dimensions exactly
                                    const updatedCoords = {
                                        ...updatedSection,
                                        x: updatedSection.x / finalScale,
                                        y: updatedSection.y / finalScale,
                                        width: updatedSection.width / finalScale,
                                        height: updatedSection.height / finalScale,
                                    };

                                    onSectionUpdate(updatedCoords);
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

            {/* Zoom controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="h-8 w-8"
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomReset}
                    disabled={zoom === 1}
                    className="h-8 w-8"
                    title="Reset zoom"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="h-8 w-8"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
