'use client';

import { ImageSectionComponent } from '@/components/pdf-editor/ImageSection';
import { ImageSection, PageDimensions, ResizeInfo } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';

type ResizeHandle = ResizeInfo['handle'];

interface PDFCanvasProps {
    sections: ImageSection[];
    onSectionUpdate: (section: ImageSection) => void;
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    onDuplicate: (section: ImageSection) => void;
    onDelete: (sectionId: string) => void;
    backgroundPDF: string | null;
    currentPage: number;
    pageSize: PageDimensions;
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794; // 210mm
const A4_HEIGHT = 1123; // 297mm

export function PDFCanvas({
    sections,
    onSectionUpdate,
    onImageUpload,
    onDuplicate,
    onDelete,
    backgroundPDF,
    currentPage,
    pageSize,
}: PDFCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [resizing, setResizing] = useState<{
        id: string;
        handle: ResizeHandle;
        startWidth: number;
        startHeight: number;
        startX: number;
        startY: number;
    } | null>(null);
    const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent, sectionId: string, section: ImageSection) => {
        e.stopPropagation();
        setSelectedSectionId(sectionId);
        setIsDragging(true);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
        });
        setInitialPosition({
            x: section.x,
            y: section.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && selectedSectionId) {
            const section = sections.find((s) => s.id === selectedSectionId);
            if (section) {
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;

                const newX = Math.max(
                    0,
                    Math.min(initialPosition.x + dx, pageSize.width - section.width),
                );
                const newY = Math.max(
                    0,
                    Math.min(initialPosition.y + dy, pageSize.height - section.height),
                );

                onSectionUpdate({
                    ...section,
                    x: newX,
                    y: newY,
                });
            }
        } else if (resizing && startCoords && containerRef.current) {
            const section = sections.find((s) => s.id === resizing.id);
            if (!section) return;

            const deltaX = e.clientX - startCoords.x;
            const deltaY = e.clientY - startCoords.y;

            let newWidth = resizing.startWidth;
            let newHeight = resizing.startHeight;

            switch (resizing.handle) {
                case 'right':
                    newWidth = Math.max(50, resizing.startWidth + deltaX);
                    break;
                case 'bottom':
                    newHeight = Math.max(50, resizing.startHeight + deltaY);
                    break;
                case 'bottomRight':
                    newWidth = Math.max(50, resizing.startWidth + deltaX);
                    newHeight = Math.max(50, resizing.startHeight + deltaY);
                    break;
            }

            // Ensure within bounds
            newWidth = Math.min(newWidth, A4_WIDTH - section.x);
            newHeight = Math.min(newHeight, A4_HEIGHT - section.y);

            onSectionUpdate({
                ...section,
                width: newWidth,
                height: newHeight,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setResizing(null);
        setStartCoords(null);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setSelectedSectionId(null);
        }
    };

    return (
        <div className="flex justify-center">
            <div
                ref={canvasRef}
                className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                style={{
                    width: pageSize.width,
                    height: pageSize.height,
                    backgroundImage: backgroundPDF ? `url(${backgroundPDF})` : undefined,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {sections
                    .filter((section) => section.page === currentPage)
                    .map((section) => (
                        <div
                            key={section.id}
                            className={`absolute ${selectedSectionId === section.id ? 'z-50' : 'z-10'}`}
                            style={{
                                left: section.x,
                                top: section.y,
                                width: section.width,
                                height: section.height,
                            }}
                            data-testid="image-section"
                            onMouseDown={(e) => handleMouseDown(e, section.id, section)}
                        >
                            <ImageSectionComponent
                                section={section}
                                isSelected={selectedSectionId === section.id}
                                onUpdate={onSectionUpdate}
                                onImageUpload={onImageUpload}
                                onDuplicate={onDuplicate}
                                onDelete={onDelete}
                                onClick={() => setSelectedSectionId(section.id)}
                            />
                            {selectedSectionId === section.id && (
                                <>
                                    <div
                                        className="absolute top-0 right-0 w-3 h-3 bg-docmosaic-terracotta cursor-ew-resize resize-handle"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            // Handle resize logic
                                        }}
                                    />
                                    <div
                                        className="absolute bottom-0 left-0 w-3 h-3 bg-docmosaic-terracotta cursor-ns-resize resize-handle"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            // Handle resize logic
                                        }}
                                    />
                                    <div
                                        className="absolute bottom-0 right-0 w-3 h-3 bg-docmosaic-terracotta cursor-nwse-resize resize-handle"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            // Handle resize logic
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
