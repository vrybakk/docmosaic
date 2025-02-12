'use client';

import { getPageDimensionsWithOrientation } from '@/lib/page-sizes';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/types';
import Image from 'next/image';

interface PagePreviewProps {
    pages: Page[];
    sections: ImageSection[];
    currentPage: number;
    pageSize: PageSize;
    orientation: PageOrientation;
    onPageChange: (pageNumber: number) => void;
    onDeletePage: (pageIndex: number) => void;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
    dragOverPageIndex: number | null;
    dropPosition: 'top' | 'bottom' | null;
}

export function PagePreview({
    pages,
    sections,
    currentPage,
    pageSize,
    orientation,
    onPageChange,
    onDeletePage,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    dragOverPageIndex,
    dropPosition,
}: PagePreviewProps) {
    return (
        <div className="w-64 border-l bg-gray-50 p-4 overflow-auto">
            <h3 className="font-semibold mb-4">Page Preview</h3>
            <div className="space-y-4">
                {pages.map((page, index) => (
                    <div
                        key={page.id}
                        className="relative group"
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => onDragOver(e, index)}
                        onDrop={(e) => onDrop(e, index)}
                    >
                        <div
                            className={`w-full bg-white rounded-lg shadow cursor-pointer transition-all relative overflow-hidden
                ${index + 1 === currentPage ? 'ring-2 ring-docmosaic-terracotta' : 'hover:ring-2 hover:ring-docmosaic-orange'}
                ${dragOverPageIndex === index && dropPosition === 'top' ? 'border-t-4 border-docmosaic-terracotta' : ''}
                ${dragOverPageIndex === index && dropPosition === 'bottom' ? 'border-b-4 border-docmosaic-terracotta' : ''}`}
                            style={{
                                aspectRatio: `${getPageDimensionsWithOrientation(pageSize, orientation).width} / ${
                                    getPageDimensionsWithOrientation(pageSize, orientation).height
                                }`,
                            }}
                            onClick={() => onPageChange(index + 1)}
                        >
                            <div className="absolute inset-0">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        transform: `scale(${Math.min(
                                            220 /
                                                getPageDimensionsWithOrientation(
                                                    pageSize,
                                                    orientation,
                                                ).width,
                                            310 /
                                                getPageDimensionsWithOrientation(
                                                    pageSize,
                                                    orientation,
                                                ).height,
                                        )})`,
                                        transformOrigin: 'top left',
                                        width: getPageDimensionsWithOrientation(
                                            pageSize,
                                            orientation,
                                        ).width,
                                        height: getPageDimensionsWithOrientation(
                                            pageSize,
                                            orientation,
                                        ).height,
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

                            <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10">
                                Page {index + 1}
                            </div>
                        </div>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button
                                onClick={() => onDeletePage(index)}
                                className="w-6 h-6 bg-white rounded shadow hover:bg-red-100 text-red-600"
                                title="Delete page"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
