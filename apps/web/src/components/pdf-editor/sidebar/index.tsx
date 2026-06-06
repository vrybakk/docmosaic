'use client';

import { Button } from '@/components/ui/core/button';
import { ScrollArea } from '@/components/ui/navigation/scroll-area';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { cn } from '@/lib/utils';
import { ImageIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { PagePreview } from './page-preview';

interface SidebarProps {
    /** All pages in the document */
    pages: Page[];
    /** All sections in the document */
    sections: ImageSection[];
    /** Currently selected page number */
    currentPage: number;
    /** The page size (A4, etc.) */
    pageSize: PageSize;
    /** The page orientation */
    orientation: PageOrientation;
    /** The formatted last modified date */
    lastModified: string;
    /** Callback to add a new image section */
    onAddSection: () => void;
    /** Callback to add a new page */
    onAddPage: () => void;
    /** Callback when a page is selected */
    onPageChange: (pageNumber: number) => void;
    /** Callback when a page is deleted */
    onDeletePage: (pageIndex: number) => void;
    /** Callback when pages are reordered */
    onReorderPages: (fromIndex: number, toIndex: number) => void;
}

/**
 * Sidebar component for the PDF editor
 * Contains page management and document info
 */
export function Sidebar({
    pages,
    sections,
    currentPage,
    pageSize,
    orientation,
    lastModified,
    onAddSection,
    onAddPage,
    onPageChange,
    onDeletePage,
    onReorderPages,
}: SidebarProps) {
    const [dragState, setDragState] = useState<{
        draggedIndex: number | null;
        dropTarget: number | null;
        dropPosition: 'top' | 'bottom' | null;
    }>({
        draggedIndex: null,
        dropTarget: null,
        dropPosition: null,
    });

    // Handle drag start
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        setDragState({
            draggedIndex: index,
            dropTarget: null,
            dropPosition: null,
        });
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragState.draggedIndex === null || dragState.draggedIndex === index) {
            return;
        }

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const midpoint = (rect.bottom + rect.top) / 2;
        const position = e.clientY < midpoint ? 'top' : 'bottom';

        setDragState((prev) => ({
            ...prev,
            dropTarget: index,
            dropPosition: position,
        }));
    };

    // Handle drag end
    const handleDragEnd = () => {
        if (
            dragState.draggedIndex !== null &&
            dragState.dropTarget !== null &&
            dragState.dropPosition
        ) {
            const toIndex =
                dragState.dropPosition === 'bottom'
                    ? dragState.dropTarget + 1
                    : dragState.dropTarget;

            // Only reorder if the position actually changes
            if (dragState.draggedIndex !== toIndex && dragState.draggedIndex !== toIndex - 1) {
                onReorderPages(dragState.draggedIndex, toIndex);
            }
        }

        setDragState({
            draggedIndex: null,
            dropTarget: null,
            dropPosition: null,
        });
    };

    return (
        <div className="w-64 border-r bg-gray-50/50 flex flex-col">
            {/* Actions */}
            <div className="p-4 border-b bg-white">
                <div className="space-y-2">
                    <Button
                        variant="caramel"
                        onClick={onAddSection}
                        className={cn('w-full', 'add-image-button-click-trigger')}
                        icon={<ImageIcon className="h-4 w-4" />}
                    >
                        Add Image
                    </Button>
                    <Button
                        variant="white"
                        onClick={onAddPage}
                        className={cn('w-full', 'add-page-button-click-trigger')}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Add Page
                    </Button>
                </div>
            </div>

            {/* Pages */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 pb-2">
                    <h2 className="text-sm font-semibold text-docmosaic-purple">Pages</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 pt-2">
                        <div className="space-y-4">
                            {pages.map((page, index) => (
                                <PagePreview
                                    key={page.id}
                                    page={page}
                                    index={index}
                                    isSelected={currentPage === index + 1}
                                    sections={sections}
                                    pageSize={pageSize}
                                    orientation={orientation}
                                    onSelect={() => onPageChange(index + 1)}
                                    onDelete={() => onDeletePage(index)}
                                    dragHandlers={{
                                        onDragStart: (e) => handleDragStart(e, index),
                                        onDragEnd: handleDragEnd,
                                        onDragOver: (e) => handleDragOver(e, index),
                                    }}
                                    dropIndicators={
                                        dragState.dropTarget === index
                                            ? {
                                                  isDragOver: true,
                                                  dropPosition: dragState.dropPosition,
                                              }
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Info */}
            <div className="p-4 border-t bg-white">
                <div className="text-sm text-docmosaic-purple/70 space-y-1">
                    <p>Pages: {pages.length}</p>
                    <p>Last modified: {lastModified}</p>
                </div>
            </div>
        </div>
    );
}
