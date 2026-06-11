'use client';

import {
    getPageDimensionsWithOrientation,
    type Section,
    type Page,
    type PageOrientation,
    type PageSize,
} from '@docmosaic/core';
import { Trash2 } from 'lucide-react';
import { useEditorConfig } from '../../context/editor-config';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface PageThumbnailProps {
    /** The page data */
    page: Page;
    /** The page index */
    index: number;
    /** Whether this page is currently selected */
    isSelected: boolean;
    /** The sections (images) on this page */
    sections: Section[];
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
    /**
     * When `true`, the per-page delete button is hidden and the thumbnail
     * is not `draggable` (so it cannot be reordered). The thumbnail still
     * stays selectable. Defaults to `false`.
     */
    readOnly?: boolean;
}

/**
 * Single-page thumbnail rendered inside `Editor.Pages`.
 *
 * @remarks
 * Mostly used internally by the bundled `Pages`. Exposed so consumers
 * who build their own sidebar (or render thumbnails outside the editor —
 * e.g. an export preview) can reuse the visuals. Unlike most primitives
 * this one takes explicit props instead of reading from {@link useEditor}
 * because it can be rendered detached from any document state.
 *
 * @example
 * ```tsx
 * <Editor.PageThumbnail
 *   page={document.pages[0]}
 *   index={0}
 *   isSelected
 *   sections={document.sections}
 *   pageSize={document.pageSize}
 *   orientation={document.orientation}
 *   onSelect={() => {}}
 *   onDelete={() => {}}
 *   dragHandlers={{ onDragStart: noop, onDragEnd: noop, onDragOver: noop }}
 * />
 * ```
 */
export function PageThumbnail({
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
    readOnly = false,
}: PageThumbnailProps) {
    const { imageRenderer: Image } = useEditorConfig();
    const pageDimensions = getPageDimensionsWithOrientation(pageSize, orientation);
    const scale = Math.min(220 / pageDimensions.width, 310 / pageDimensions.height);

    return (
        <div
            className="relative group"
            draggable={!readOnly}
            onDragStart={dragHandlers.onDragStart}
            onDragEnd={dragHandlers.onDragEnd}
            onDragOver={dragHandlers.onDragOver}
        >
            <div
                className={cn(
                    'w-full bg-white rounded-lg shadow cursor-pointer transition-all relative overflow-hidden',
                    isSelected && 'ring-2 ring-secondary',
                    !isSelected && 'hover:ring-2 hover:ring-accent',
                    dropIndicators?.isDragOver &&
                        dropIndicators.dropPosition === 'top' &&
                        'border-t-4 border-secondary',
                    dropIndicators?.isDragOver &&
                        dropIndicators.dropPosition === 'bottom' &&
                        'border-b-4 border-secondary',
                )}
                style={{
                    aspectRatio: `${pageDimensions.width} / ${pageDimensions.height}`,
                }}
                onClick={onSelect}
            >
                <div className="absolute inset-0">
                    {/* Page.background — color first, then image. */}
                    {page.background?.color && (
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: page.background.color }}
                        />
                    )}
                    {page.background?.image && (
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${page.background.image})` }}
                        />
                    )}
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
                                        left: section.x,
                                        top: section.y,
                                        width: section.width,
                                        height: section.height,
                                    }}
                                >
                                    {section.type === 'image' && section.imageUrl && (
                                        <Image
                                            src={section.imageUrl}
                                            alt=""
                                            fill
                                            className="object-contain"
                                        />
                                    )}
                                    {section.type === 'text' && (
                                        <div
                                            className="w-full h-full overflow-hidden text-[6px] leading-tight"
                                            style={{ color: section.color ?? 'rgb(0,0,0)' }}
                                        >
                                            {section.text}
                                        </div>
                                    )}
                                    {section.type === 'shape' && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            height="100%"
                                            viewBox={`0 0 ${section.width} ${section.height}`}
                                            preserveAspectRatio="none"
                                            style={{ opacity: section.opacity ?? 1 }}
                                            aria-hidden="true"
                                        >
                                            {section.shape === 'rect' && (
                                                <rect
                                                    x={0}
                                                    y={0}
                                                    width={section.width}
                                                    height={section.height}
                                                    fill={
                                                        section.fill === 'transparent'
                                                            ? 'none'
                                                            : (section.fill ?? 'none')
                                                    }
                                                    stroke={section.stroke ?? '#000'}
                                                    strokeWidth={section.strokeWidth ?? 1}
                                                />
                                            )}
                                            {section.shape === 'circle' && (
                                                <ellipse
                                                    cx={section.width / 2}
                                                    cy={section.height / 2}
                                                    rx={section.width / 2}
                                                    ry={section.height / 2}
                                                    fill={
                                                        section.fill === 'transparent'
                                                            ? 'none'
                                                            : (section.fill ?? 'none')
                                                    }
                                                    stroke={section.stroke ?? '#000'}
                                                    strokeWidth={section.strokeWidth ?? 1}
                                                />
                                            )}
                                            {section.shape === 'line' && (
                                                <line
                                                    x1={0}
                                                    y1={0}
                                                    x2={section.width}
                                                    y2={section.height}
                                                    stroke={section.stroke ?? '#000'}
                                                    strokeWidth={section.strokeWidth ?? 1}
                                                />
                                            )}
                                        </svg>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                    Page {index + 1}
                </div>
            </div>

            {!readOnly && (
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
            )}
        </div>
    );
}
