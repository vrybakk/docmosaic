'use client';

import { Button } from '@/components/ui/core/button';
import Loader from '@/components/ui/data-display/loader';
import { trackEvent } from '@/lib/analytics';
import { getDeviceInfo } from '@/lib/mobile/detection';
import {
    createTouchGestureManager,
    TouchGestureManager,
    type LongPressEvent,
    type SwipeEvent,
} from '@/lib/mobile/gestures';
import { hapticFeedback } from '@/lib/mobile/haptics';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { getPageDimensionsWithOrientation } from '@/lib/pdf-editor/utils/dimensions';
import { cn } from '@/lib/utils';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const PINCH_THRESHOLD = 10;

/**
 * Canvas component for PDF editor
 * Handles page display, zoom, pan, and image section interactions
 */
export function Canvas({
    page,
    pageSize,
    orientation,
    sections,
    selectedSectionId,
    currentPage,
    totalPages,
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
    const [isLoading, setIsLoading] = useState(true);
    const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);

    const pageDimensions = useMemo(() => {
        return getPageDimensionsWithOrientation(pageSize, orientation);
    }, [pageSize, orientation]);

    // Mobile gesture manager
    const gestureManagerRef = useRef<TouchGestureManager | null>(null);

    // Initialize gesture manager on mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            gestureManagerRef.current = createTouchGestureManager({
                longPressTimeout: 500,
                doubleTapTimeout: 300,
                swipeThreshold: 50,
                preventDefault: true,
            });
        }
    }, []);

    // Device info for mobile optimizations
    const [deviceInfo, setDeviceInfo] = useState(() => ({ isMobile: false }));

    // Initialize device info on mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDeviceInfo(getDeviceInfo());
        }
    }, []);

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

    // Zoom controls with analytics and haptics
    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
        setZoom(newZoom);
        trackEvent.zoom(newZoom);

        // Haptic feedback on mobile
        if (deviceInfo?.isMobile && hapticFeedback) {
            hapticFeedback.zoom();
        }
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
        setZoom(newZoom);
        trackEvent.zoom(newZoom);

        // Haptic feedback on mobile
        if (deviceInfo?.isMobile && hapticFeedback) {
            hapticFeedback.zoom();
        }
    };

    const handleZoomReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        trackEvent.zoom(1);

        // Haptic feedback on mobile
        if (deviceInfo?.isMobile && hapticFeedback) {
            hapticFeedback.medium();
        }
    }, [deviceInfo?.isMobile]);

    // Mouse wheel zoom with analytics and haptics
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM);
            setZoom(newZoom);
            trackEvent.zoom(newZoom);

            // Haptic feedback on mobile for trackpad zoom
            if (deviceInfo?.isMobile && hapticFeedback) {
                hapticFeedback.light();
            }
        }
    };

    // Touch interactions with enhanced haptics
    const triggerHaptic = () => {
        if (hapticFeedback) {
            hapticFeedback.zoom();
        }
    };

    const getTouchDistance = (touches: React.TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
        if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2,
        };
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Check if the touch target is a section or resize handle (should not handle canvas touch)
        const target = e.target as HTMLElement;
        const isSection = target.closest('[data-section]');
        const isResizeHandle = target.closest('[data-resize-handle]');
        const isButton = target.closest('button');
        const isInput = target.closest('input');
        const isFileInput = target.closest('[data-section-input]');

        if (isSection || isResizeHandle || isButton || isInput || isFileInput) {
            return; // Don't handle canvas touch for interactive elements
        }

        if (e.touches.length === 2) {
            e.preventDefault();
            touchStartRef.current = {
                x: getTouchCenter(e.touches).x,
                y: getTouchCenter(e.touches).y,
                distance: getTouchDistance(e.touches),
            };
            triggerHaptic();
        } else if (e.touches.length === 1) {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };

            // Handle single touch gestures
            if (gestureManagerRef.current) {
                gestureManagerRef.current.handleTouchStart(e.nativeEvent);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        // Check if the touch target is a section or resize handle (should not handle canvas touch)
        const target = e.target as HTMLElement;
        const isSection = target.closest('[data-section]');
        const isResizeHandle = target.closest('[data-resize-handle]');
        const isButton = target.closest('button');
        const isInput = target.closest('input');
        const isFileInput = target.closest('[data-section-input]');

        if (isSection || isResizeHandle || isButton || isInput || isFileInput) {
            return; // Don't handle canvas touch for interactive elements
        }

        if (e.touches.length === 2 && touchStartRef.current.distance !== undefined) {
            e.preventDefault();
            const newDistance = getTouchDistance(e.touches);
            const distanceDelta = newDistance - touchStartRef.current.distance;

            if (Math.abs(distanceDelta) > PINCH_THRESHOLD) {
                const zoomDelta = (distanceDelta / touchStartRef.current.distance) * 0.5;
                setZoom((prev) => Math.min(Math.max(prev + zoomDelta, MIN_ZOOM), MAX_ZOOM));
                touchStartRef.current.distance = newDistance;
                triggerHaptic();
            }
        } else if (e.touches.length === 1) {
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

            // Handle single touch gesture move
            if (gestureManagerRef.current) {
                gestureManagerRef.current.handleTouchMove(e.nativeEvent);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        // Check if the touch target is a section or resize handle (should not handle canvas touch)
        const target = e.target as HTMLElement;
        const isSection = target.closest('[data-section]');
        const isResizeHandle = target.closest('[data-resize-handle]');
        const isButton = target.closest('button');
        const isInput = target.closest('input');
        const isFileInput = target.closest('[data-section-input]');

        if (isSection || isResizeHandle || isButton || isInput || isFileInput) {
            return; // Don't handle canvas touch for interactive elements
        }

        touchStartRef.current = null;

        // Handle single touch gesture end
        if (e.changedTouches.length === 1 && gestureManagerRef.current) {
            gestureManagerRef.current.handleTouchEnd(e.nativeEvent);
        }
    };

    // Filter sections for current page
    const pageSections = (sections || []).filter((section) => section.page === currentPage);
    const finalScale = (scale || 1) * (zoom || 1);

    // Setup gesture callbacks
    useEffect(() => {
        const gestureManager = gestureManagerRef.current;
        if (!gestureManager) return;

        // Long-press for context menu (future feature)
        gestureManager.onLongPress((event: LongPressEvent) => {
            if (hapticFeedback) {
                hapticFeedback.medium();
            }
            // TODO: Show context menu at coordinates
            console.log('Long press detected:', event.coordinates);
        });

        // Swipe gestures for page navigation
        gestureManager.onSwipe(['left', 'right'], (event: SwipeEvent) => {
            if (hapticFeedback) {
                hapticFeedback.pageChange();
            }
            // Safely check if we can navigate
            if (event.direction === 'left' && currentPage < totalPages) {
                // TODO: Navigate to next page
                console.log('Swipe left - next page');
            } else if (event.direction === 'right' && currentPage > 1) {
                // TODO: Navigate to previous page
                console.log('Swipe right - previous page');
            }
        });

        // Double-tap to reset zoom
        gestureManager.onDoubleTap(() => {
            if (hapticFeedback) {
                hapticFeedback.medium();
            }
            handleZoomReset();
        });

        return () => {
            if (gestureManager) {
                gestureManager.destroy();
            }
        };
    }, [currentPage, totalPages, handleZoomReset]);

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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {isLoading ? (
                <Loader />
            ) : (
                <div className="flex items-center justify-center min-h-full">
                    {/* Page container */}
                    <div
                        ref={combinedRef}
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

            {/* Zoom controls - mobile optimized */}
            {!isLoading && (
                <div
                    className={cn(
                        'absolute top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 z-10',
                        'transition-all duration-200',
                        deviceInfo?.isMobile && 'gap-3 p-2', // More spacing on mobile
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={(zoom || 1) <= MIN_ZOOM}
                        className={cn(
                            'h-8 w-8',
                            deviceInfo?.isMobile && 'h-10 w-10', // Larger on mobile
                        )}
                    >
                        <Minus
                            className={cn(
                                'h-4 w-4',
                                deviceInfo?.isMobile && 'h-5 w-5', // Larger icon on mobile
                            )}
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomReset}
                        disabled={(zoom || 1) === 1}
                        className={cn(
                            'h-8 w-8',
                            deviceInfo?.isMobile && 'h-10 w-10', // Larger on mobile
                        )}
                        title="Reset zoom"
                    >
                        <RotateCcw
                            className={cn(
                                'h-4 w-4',
                                deviceInfo?.isMobile && 'h-5 w-5', // Larger icon on mobile
                            )}
                        />
                    </Button>
                    <span
                        className={cn(
                            'text-sm font-medium w-12 text-center',
                            deviceInfo?.isMobile && 'text-base w-14', // Larger text on mobile
                        )}
                    >
                        {Math.round((zoom || 1) * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={(zoom || 1) >= MAX_ZOOM}
                        className={cn(
                            'h-8 w-8',
                            deviceInfo?.isMobile && 'h-10 w-10', // Larger on mobile
                        )}
                    >
                        <Plus
                            className={cn(
                                'h-4 w-4',
                                deviceInfo?.isMobile && 'h-5 w-5', // Larger icon on mobile
                            )}
                        />
                    </Button>
                </div>
            )}
        </div>
    );
}
