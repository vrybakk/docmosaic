'use client';

import { Button } from '@/components/ui/button';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { getPageDimensionsWithOrientation } from '@/lib/pdf-editor/utils/dimensions';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PagePreviewProps {
    /** The page data */
    page: Page;
    /** The page index */
    index: number;
    /** Whether this page is currently selected */
    isSelected: boolean;
    /** The sections (images) on this page */
    sections: ImageSection[];
    /** The page size (A4, etc.) */
    pageSize: PageSize;
    /** The page orientation */
    orientation: PageOrientation;
    /** Callback when the page is selected */
    onSelect: () => void;
    /** Callback when the page is deleted */
    onDelete: () => void;
    /** Drag and drop handlers */
    dragHandlers: {
        onDragStart: (e: React.DragEvent) => void;
        onDragEnd: () => void;
        onDragOver: (e: React.DragEvent) => void;
    };
    /** Visual indicators for drag and drop */
    dropIndicators?: {
        isDragOver: boolean;
        dropPosition: 'top' | 'bottom' | null;
    };
}

/**
 * PagePreview component
 * Displays a preview of a single page in the sidebar
 */
export function PagePreview({
    page,
    index,
    isSelected,
    sections,
    pageSize,
    orientation,
    onSelect,
    onDelete,
    dragHandlers,
    dropIndicators,
}: PagePreviewProps) {
    const pageDimensions = getPageDimensionsWithOrientation(pageSize, orientation);
    const scale = Math.min(220 / pageDimensions.width, 310 / pageDimensions.height);

    return (
        <div
            className="relative group"
            draggable
            onDragStart={dragHandlers.onDragStart}
            onDragEnd={dragHandlers.onDragEnd}
            onDragOver={dragHandlers.onDragOver}
        >
            <div
                className={cn(
                    'w-full bg-white rounded-lg shadow cursor-pointer transition-all relative overflow-hidden',
                    isSelected && 'ring-2 ring-docmosaic-purple',
                    !isSelected && 'hover:ring-2 hover:ring-docmosaic-sage',
                    dropIndicators?.isDragOver &&
                        dropIndicators.dropPosition === 'top' &&
                        'border-t-4 border-docmosaic-purple',
                    dropIndicators?.isDragOver &&
                        dropIndicators.dropPosition === 'bottom' &&
                        'border-b-4 border-docmosaic-purple',
                )}
                style={{
                    aspectRatio: `${pageDimensions.width} / ${pageDimensions.height}`,
                }}
                onClick={onSelect}
            >
                <div className="absolute inset-0">
                    {/* Background PDF if available */}
                    {page.backgroundPDF && (
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${page.backgroundPDF})` }}
                        />
                    )}

                    {/* Sections preview */}
                    <div
                        className="absolute inset-0"
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: pageDimensions.width,
                            height: pageDimensions.height,
                        }}
                    >
                        {sections
                            .filter((section) => section.page === index + 1)
                            .map((section) => (
                                <div
                                    key={section.id}
                                    className="absolute"
                                    style={{
                                        left: section.x * (72 / 96),
                                        top: section.y * (72 / 96),
                                        width: section.width * (72 / 96),
                                        height: section.height * (72 / 96),
                                    }}
                                >
                                    {section.imageUrl && (
                                        <Image
                                            src={section.imageUrl}
                                            alt=""
                                            fill
                                            className="object-contain"
                                        />
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="absolute top-2 left-2 bg-docmosaic-purple/90 text-docmosaic-cream text-xs px-2 py-1 rounded">
                    Page {index + 1}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className={cn(
                    'absolute top-2 right-2 h-6 w-6',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'bg-white hover:bg-red-50 text-red-600',
                    'shadow-sm rounded-full',
                )}
            >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete page {index + 1}</span>
            </Button>
        </div>
    );
}
