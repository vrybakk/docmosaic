'use client';

import { getPageDimensionsWithOrientation } from '@docmosaic/core';
import { ImageIcon, Plus } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { PageThumbnail } from './page-thumbnail';

interface PagesProps {
    /**
     * Compact rail mode: render only the thumbnail strip plus a single "Add
     * page" affordance — no internal "Pages" header, "Last modified" footer,
     * or "Add Image" button. Used inside the app-shell left rail, where those
     * concerns live elsewhere. Defaults to `false` (standalone sidebar).
     */
    bare?: boolean;
}

/**
 * Page list sidebar for the PDF editor. Reads pages, sections, and current
 * page from {@link useEditor}; renders one {@link PageThumbnail} per page
 * and handles drag-reorder locally.
 */
export function Pages({ bare = false }: PagesProps = {}) {
    const { state, actions, ui, readOnly } = useEditor();
    const { pages, sections, currentPage, pageSize, orientation } = state;
    const { formattedDate } = ui;

    const movePage = (fromIndex: number, toIndex: number) => {
        if (readOnly || fromIndex === toIndex) return;
        trackEvent.reorderPages();
        actions.reorderPages(fromIndex, toIndex);
    };

    const thumbnails = (
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
                    readOnly={readOnly}
                    onMovePage={movePage}
                />
            ))}
        </div>
    );

    if (bare) {
        // Compact thumbnail grid for the app-shell rail — a wrapping row of
        // small page tiles (active tile ring-accented) followed by a dashed
        // "add page" tile of the same size. Keeps the heavier standalone
        // sidebar (badge / delete / section preview) for the non-bare path.
        const dims = getPageDimensionsWithOrientation(pageSize, orientation);
        const tileHeight = 52;
        const tileWidth = dims.height ? Math.round((dims.width / dims.height) * tileHeight) : 40;

        return (
            <div className="flex w-full flex-wrap gap-2 p-3">
                {pages.map((_, index) => {
                    const isSelected = currentPage === index + 1;
                    return (
                        <button
                            key={pages[index].id}
                            type="button"
                            onClick={() => actions.changePage(index + 1)}
                            aria-label={`Page ${index + 1}`}
                            aria-current={isSelected}
                            title={`Page ${index + 1}`}
                            style={{ width: tileWidth, height: tileHeight }}
                            className={cn(
                                'rounded border bg-background transition-colors',
                                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                isSelected
                                    ? 'border-primary ring-1 ring-primary'
                                    : 'border-border hover:border-ring',
                            )}
                        />
                    );
                })}
                {!readOnly && (
                    <button
                        type="button"
                        onClick={() => {
                            trackEvent.addPage();
                            actions.addPage();
                        }}
                        aria-label="Add page"
                        title="Add page"
                        style={{ width: tileWidth, height: tileHeight }}
                        className={cn(
                            'add-page-button-click-trigger',
                            'flex items-center justify-center rounded border border-dashed border-border',
                            'text-muted-foreground transition-colors',
                            'hover:border-ring hover:text-foreground',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        )}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col">
            {!readOnly && (
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
            )}

            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 pb-2">
                    <h2 className="text-sm font-semibold text-primary">Pages</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 pt-2">{thumbnails}</div>
                </ScrollArea>
            </div>

            <div className="p-4 border-t bg-white">
                <div className="text-sm text-primary/70 space-y-1">
                    <p>Pages: {pages.length}</p>
                    <p>Last modified: {formattedDate}</p>
                </div>
            </div>
        </div>
    );
}
