'use client';

import { ImageIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { PageThumbnail } from './page-thumbnail';

/**
 * Page list sidebar for the PDF editor. Reads pages, sections, and current
 * page from {@link useEditor}; renders one {@link PageThumbnail} per page
 * and handles drag-reorder locally.
 */
export function Pages() {
    const { state, actions, ui } = useEditor();
    const { pages, sections, currentPage, pageSize, orientation } = state;
    const { formattedDate } = ui;

    const [dragState, setDragState] = useState<{
        draggedIndex: number | null;
        dropTarget: number | null;
        dropPosition: 'top' | 'bottom' | null;
    }>({
        draggedIndex: null,
        dropTarget: null,
        dropPosition: null,
    });

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        setDragState({ draggedIndex: index, dropTarget: null, dropPosition: null });
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (dragState.draggedIndex === null || dragState.draggedIndex === index) {
            return;
        }

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const midpoint = (rect.bottom + rect.top) / 2;
        const position = e.clientY < midpoint ? 'top' : 'bottom';

        setDragState((prev) => ({ ...prev, dropTarget: index, dropPosition: position }));
    };

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

            if (dragState.draggedIndex !== toIndex && dragState.draggedIndex !== toIndex - 1) {
                trackEvent.reorderPages();
                actions.reorderPages(dragState.draggedIndex, toIndex);
            }
        }

        setDragState({ draggedIndex: null, dropTarget: null, dropPosition: null });
    };

    return (
        <div className="w-64 border-r bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b bg-white">
                <div className="space-y-2">
                    <Button
                        variant="caramel"
                        onClick={() => {
                            actions.addSection();
                        }}
                        className={cn('w-full', 'add-image-button-click-trigger')}
                        icon={<ImageIcon className="h-4 w-4" />}
                    >
                        Add Image
                    </Button>
                    <Button
                        variant="white"
                        onClick={() => {
                            trackEvent.addPage();
                            actions.addPage();
                        }}
                        className={cn('w-full', 'add-page-button-click-trigger')}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Add Page
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 pb-2">
                    <h2 className="text-sm font-semibold text-editor-accent">Pages</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 pt-2">
                        <div className="space-y-4">
                            {pages.map((page, index) => (
                                <PageThumbnail
                                    key={page.id}
                                    page={page}
                                    index={index}
                                    isSelected={currentPage === index + 1}
                                    sections={sections}
                                    pageSize={pageSize}
                                    orientation={orientation}
                                    onSelect={() => actions.changePage(index + 1)}
                                    onDelete={() => actions.deletePage(index)}
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

            <div className="p-4 border-t bg-white">
                <div className="text-sm text-editor-accent/70 space-y-1">
                    <p>Pages: {pages.length}</p>
                    <p>Last modified: {formattedDate}</p>
                </div>
            </div>
        </div>
    );
}
