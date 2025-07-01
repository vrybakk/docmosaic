'use client';

import { Button } from '@/components/ui/core/button';
import Loader from '@/components/ui/data-display/loader';
import { trackEvent } from '@/lib/analytics';
import { Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { getPageDimensionsWithOrientation } from '@/lib/pdf-editor/utils/dimensions';
import { Section } from '@/lib/types';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    Minus,
    Palette,
    Plus,
    RotateCcw,
} from 'lucide-react';
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
    sections: Section[];
    /** Currently selected section ID */
    selectedSectionId: string | null;
    /** Current page number */
    currentPage: number;
    /** Callback when a section is selected */
    onSectionSelect: (sectionId: string | null) => void;
    /** Callback when a section is updated */
    onSectionUpdate: (section: Section) => void;
    /** Callback when a section is duplicated */
    onSectionDuplicate: (section: Section) => void;
    /** Callback when a section is deleted */
    onSectionDelete: (sectionId: string) => void;
    /** Callback when an image is uploaded to a section */
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    /** Callback when a new section is created */
    onSectionCreate?: (section: Section) => void;
}

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const PINCH_THRESHOLD = 10;

/**
 * Text formatting toolbar component for canvas
 */
const TextFormattingToolbar: React.FC<{
    hasSelection: boolean;
}> = ({ hasSelection }) => {
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
    const fontFamilies = [
        { value: 'helvetica', label: 'Helvetica' },
        { value: 'times', label: 'Times' },
        { value: 'courier', label: 'Courier' },
        { value: 'arial', label: 'Arial' },
    ];

    const colors = [
        '#000000',
        '#ffffff',
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffff00',
        '#ff00ff',
        '#00ffff',
        '#ffa500',
        '#800080',
    ];

    const applyFormatting = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    if (!hasSelection) return null;

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-50">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Font Family */}
                <select
                    onChange={(e) => applyFormatting('fontName', e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                    defaultValue="helvetica"
                >
                    {fontFamilies.map((font) => (
                        <option key={font.value} value={font.value}>
                            {font.label}
                        </option>
                    ))}
                </select>

                {/* Font Size */}
                <select
                    onChange={(e) => applyFormatting('fontSize', e.target.value)}
                    className="text-xs border rounded px-2 py-1 w-16"
                    defaultValue="14"
                >
                    {fontSizes.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>

                {/* Bold */}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormatting('bold')}
                    className="h-7 w-7 p-0"
                >
                    <Bold className="h-3 w-3" />
                </Button>

                {/* Italic */}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyFormatting('italic')}
                    className="h-7 w-7 p-0"
                >
                    <Italic className="h-3 w-3" />
                </Button>

                {/* Text Alignment */}
                <div className="flex">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyFormatting('justifyLeft')}
                        className="h-7 w-7 p-0 rounded-r-none"
                    >
                        <AlignLeft className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyFormatting('justifyCenter')}
                        className="h-7 w-7 p-0 rounded-none border-l-0"
                    >
                        <AlignCenter className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyFormatting('justifyRight')}
                        className="h-7 w-7 p-0 rounded-l-none border-l-0"
                    >
                        <AlignRight className="h-3 w-3" />
                    </Button>
                </div>

                {/* Text Color */}
                <div className="flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    <div className="flex gap-1">
                        {colors.slice(0, 5).map((color) => (
                            <button
                                key={color}
                                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => applyFormatting('foreColor', color)}
                                title={`Text color: ${color}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Color */}
                <div className="flex items-center gap-1">
                    <span className="text-xs">BG:</span>
                    <div className="flex gap-1">
                        <button
                            className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                            onClick={() => applyFormatting('backColor', 'transparent')}
                            title="No background"
                        >
                            <div
                                className="w-full h-full"
                                style={{
                                    background:
                                        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                    backgroundSize: '4px 4px',
                                }}
                            />
                        </button>
                        {colors.slice(0, 4).map((color) => (
                            <button
                                key={`bg-${color}`}
                                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => applyFormatting('backColor', color)}
                                title={`Background color: ${color}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    const [hasTextSelection, setHasTextSelection] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null);
    const pageDimensions = getPageDimensionsWithOrientation(pageSize, orientation);

    // Handle text selection detection across all text sections
    const handleTextSelection = () => {
        const selection = window.getSelection();
        const hasSelection = selection && selection.toString().length > 0;
        setHasTextSelection(hasSelection || false);
    };

    // Add global selection listeners
    useEffect(() => {
        document.addEventListener('selectionchange', handleTextSelection);
        return () => {
            document.removeEventListener('selectionchange', handleTextSelection);
        };
    }, []);

    // Auto-scale page to fit container
    useEffect(() => {
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
    }, [pageDimensions.width, pageDimensions.height]);

    // Zoom controls with analytics
    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
        setZoom(newZoom);
        trackEvent.zoom(newZoom);
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
        setZoom(newZoom);
        trackEvent.zoom(newZoom);
    };

    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        trackEvent.zoom(1);
    };

    // Mouse wheel zoom with analytics
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM);
            setZoom(newZoom);
            trackEvent.zoom(newZoom);
        }
    };

    // Touch interactions
    const triggerHaptic = () => {
        if ('vibrate' in navigator) navigator.vibrate(50);
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
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

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
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = null;
    };

    // Filter sections for current page
    const pageSections = sections.filter((section) => section.page === currentPage);
    const finalScale = scale * zoom;

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
                            width: pageDimensions.width * finalScale,
                            height: pageDimensions.height * finalScale,
                            transform: `translate(${pan.x}px, ${pan.y}px)`,
                        }}
                    >
                        {/* Background PDF */}
                        {page.backgroundPDF && (
                            <div
                                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${page.backgroundPDF})` }}
                            />
                        )}

                        {/* Image sections */}
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

            {/* Zoom controls */}
            {!isLoading && (
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
            )}

            {/* Text formatting toolbar */}
            <TextFormattingToolbar hasSelection={hasTextSelection} />
        </div>
    );
}
