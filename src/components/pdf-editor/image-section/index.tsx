'use client';

import { Button } from '@/components/ui/core/button';
import { ImageSection } from '@/lib/pdf-editor/types';
import { cn } from '@/lib/utils';
import { useDrag } from '@use-gesture/react';
import { Copy, ImageIcon, Maximize2, RefreshCw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

// Constants for size constraints
const MIN_SECTION_SIZE = 100; // Minimum size in pixels
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageSectionProps {
    /** The section data */
    section: ImageSection;
    /** Whether the section is currently selected */
    isSelected: boolean;
    /** Callback when the section is updated */
    onUpdate: (section: ImageSection) => void;
    /** Callback when an image is uploaded */
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    /** Callback when the section is duplicated */
    onDuplicate: (section: ImageSection) => void;
    /** Callback when the section is deleted */
    onDelete: (sectionId: string) => void;
    /** Click handler */
    onClick: (e: React.MouseEvent) => void;
}

type ResizeHandle =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';

interface ResizeHandlesProps {
    onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
}

interface UploadProgressInfo {
    status: 'reading' | 'processing' | 'resizing' | 'complete' | 'error';
    progress: number;
    message: string;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResizeStart }) => (
    <>
        {/* Corner handles - always visible on hover */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
            {/* Top-left */}
            <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full cursor-nw-resize hover:scale-125 transition-transform"
                onMouseDown={(e) => onResizeStart(e, 'topLeft')}
            />
            {/* Top-right */}
            <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full cursor-ne-resize hover:scale-125 transition-transform"
                onMouseDown={(e) => onResizeStart(e, 'topRight')}
            />
            {/* Bottom-left */}
            <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full cursor-sw-resize hover:scale-125 transition-transform"
                onMouseDown={(e) => onResizeStart(e, 'bottomLeft')}
            />
            {/* Bottom-right */}
            <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full cursor-se-resize hover:scale-125 transition-transform"
                onMouseDown={(e) => onResizeStart(e, 'bottomRight')}
            />

            {/* Edge handles */}
            <div
                className="absolute top-0 left-4 right-4 h-2 bg-transparent hover:bg-docmosaic-purple/20 cursor-n-resize group"
                onMouseDown={(e) => onResizeStart(e, 'top')}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover:opacity-100" />
            </div>
            <div
                className="absolute bottom-0 left-4 right-4 h-2 bg-transparent hover:bg-docmosaic-purple/20 cursor-s-resize group"
                onMouseDown={(e) => onResizeStart(e, 'bottom')}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover:opacity-100" />
            </div>
            <div
                className="absolute left-0 top-4 bottom-4 w-2 bg-transparent hover:bg-docmosaic-purple/20 cursor-w-resize group"
                onMouseDown={(e) => onResizeStart(e, 'left')}
            >
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover:opacity-100" />
            </div>
            <div
                className="absolute right-0 top-4 bottom-4 w-2 bg-transparent hover:bg-docmosaic-purple/20 cursor-e-resize group"
                onMouseDown={(e) => onResizeStart(e, 'right')}
            >
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover:opacity-100" />
            </div>
        </div>
    </>
);

/**
 * ImageSection component
 * Handles individual image sections within the Canvas
 */
export function ImageSectionComponent({
    section,
    isSelected,
    onUpdate,
    onImageUpload,
    onDuplicate,
    onDelete,
    onClick,
}: ImageSectionProps) {
    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const resizeStart = useRef<{
        x: number;
        y: number;
        width: number;
        height: number;
        left: number;
        top: number;
        aspectRatio?: number;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isDroppingFile, setIsDroppingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
        e.preventDefault();
        e.stopPropagation();

        // Set resize state
        setIsResizing(true);
        setIsDragging(false);

        // Store initial dimensions
        const startData = {
            x: e.clientX,
            y: e.clientY,
            width: section.width,
            height: section.height,
            left: section.x,
            top: section.y,
            aspectRatio: section.imageUrl ? section.width / section.height : undefined,
        };
        resizeStart.current = startData;

        // Add event listeners
        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!resizeStart.current || !handle) return;

            const dx = e.clientX - startData.x;
            const dy = e.clientY - startData.y;

            let newWidth = startData.width;
            let newHeight = startData.height;
            let newX = startData.left;
            let newY = startData.top;

            const isCorner = handle.length > 5;
            const aspectRatio = isCorner && startData.aspectRatio;

            // Resize logic with aspect ratio maintenance for corners
            switch (handle) {
                case 'right':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width + dx);
                    break;
                case 'left':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width - dx);
                    newX = startData.left + (startData.width - newWidth);
                    break;
                case 'bottom':
                    newHeight = Math.max(MIN_SECTION_SIZE, startData.height + dy);
                    break;
                case 'top':
                    newHeight = Math.max(MIN_SECTION_SIZE, startData.height - dy);
                    newY = startData.top + (startData.height - newHeight);
                    break;
                case 'bottomRight':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width + dx);
                    if (aspectRatio) {
                        newHeight = newWidth / aspectRatio;
                    } else {
                        newHeight = Math.max(MIN_SECTION_SIZE, startData.height + dy);
                    }
                    break;
                case 'bottomLeft':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width - dx);
                    newX = startData.left + (startData.width - newWidth);
                    if (aspectRatio) {
                        newHeight = newWidth / aspectRatio;
                    } else {
                        newHeight = Math.max(MIN_SECTION_SIZE, startData.height + dy);
                    }
                    break;
                case 'topRight':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width + dx);
                    if (aspectRatio) {
                        newHeight = newWidth / aspectRatio;
                        newY = startData.top + (startData.height - newHeight);
                    } else {
                        newHeight = Math.max(MIN_SECTION_SIZE, startData.height - dy);
                        newY = startData.top + (startData.height - newHeight);
                    }
                    break;
                case 'topLeft':
                    newWidth = Math.max(MIN_SECTION_SIZE, startData.width - dx);
                    newX = startData.left + (startData.width - newWidth);
                    if (aspectRatio) {
                        newHeight = newWidth / aspectRatio;
                        newY = startData.top + (startData.height - newHeight);
                    } else {
                        newHeight = Math.max(MIN_SECTION_SIZE, startData.height - dy);
                        newY = startData.top + (startData.height - newHeight);
                    }
                    break;
            }

            onUpdate({
                ...section,
                width: Math.round(newWidth),
                height: Math.round(newHeight),
                x: Math.round(newX),
                y: Math.round(newY),
            });
        };

        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Clear resize state
            setIsResizing(false);
            resizeStart.current = null;

            // Remove event listeners
            window.removeEventListener('mousemove', handleMouseMove, { capture: true });
            window.removeEventListener('mouseup', handleMouseUp, { capture: true });
        };

        // Add event listeners with capture phase
        window.addEventListener('mousemove', handleMouseMove, { capture: true });
        window.addEventListener('mouseup', handleMouseUp, { capture: true });
    };

    // Use gesture hook for drag
    const bindDrag = useDrag(
        ({ movement: [mx, my], first, active, memo }) => {
            if (isResizing) {
                return false;
            }

            if (first) {
                setIsDragging(true);
                return { startX: section.x, startY: section.y };
            }

            if (!active) {
                setIsDragging(false);
                return memo;
            }

            // Get page dimensions from the parent element
            const pageElement = document.querySelector('.bg-white.shadow-lg') as HTMLElement;
            if (!pageElement) return memo;

            const { startX, startY } = memo || { startX: section.x, startY: section.y };

            // Calculate new position with bounds
            const maxX = Math.max(0, pageElement.clientWidth - section.width);
            const maxY = Math.max(0, pageElement.clientHeight - section.height);

            const newX = Math.max(0, Math.min(maxX, startX + mx));
            const newY = Math.max(0, Math.min(maxY, startY + my));

            onUpdate({
                ...section,
                x: Math.round(newX),
                y: Math.round(newY),
            });

            return memo;
        },
        {
            enabled: !isResizing,
            bounds: { left: 0, top: 0 },
            filterTaps: true,
            rubberband: true,
        },
    );

    // Handle click to select
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    // Handle file drop
    const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDroppingFile(false);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
            return;
        }

        try {
            setUploadProgress({ status: 'reading', progress: 0, message: 'Reading file...' });
            const img = document.createElement('img');

            const reader = new FileReader();
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress({
                        status: 'reading',
                        progress,
                        message: `Reading file... ${Math.round(progress)}%`,
                    });
                }
            };

            reader.onload = () => {
                setUploadProgress({
                    status: 'processing',
                    progress: 0,
                    message: 'Processing image...',
                });
                img.src = reader.result as string;
            };

            reader.readAsDataURL(file);

            img.onload = () => {
                setUploadProgress({
                    status: 'resizing',
                    progress: 50,
                    message: 'Resizing image...',
                });

                // Create a canvas to resize the image if needed
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }

                // Set canvas dimensions to match the section size while maintaining aspect ratio
                const aspectRatio = img.width / img.height;
                const targetWidth = section.width;
                const targetHeight = section.width / aspectRatio;

                // Update section height to maintain aspect ratio
                onUpdate({
                    ...section,
                    height: Math.round(targetHeight),
                });

                // Set canvas dimensions
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Draw the image with proper dimensions
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                setUploadProgress({
                    status: 'complete',
                    progress: 100,
                    message: 'Upload complete!',
                });

                // Convert to base64 and update the section
                const base64 = canvas.toDataURL(file.type);
                onImageUpload(section.id, base64);

                // Clear progress after a short delay
                setTimeout(() => setUploadProgress(null), 1000);
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadProgress({
                status: 'error',
                progress: 0,
                message: 'Error uploading image. Please try again.',
            });
            toast.error('Error uploading image. Please try again.');
        }
    };

    // Handle drag over for files
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes('Files')) {
            setIsDroppingFile(true);
        }
    };

    // Handle drag leave for files
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDroppingFile(false);
    };

    // Handle image upload
    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation();
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    if (imageUrl) {
                        const img = document.createElement('img');
                        img.onload = () => {
                            const aspectRatio = img.width / img.height;
                            const newHeight = section.width / aspectRatio;
                            onUpdate({
                                ...section,
                                imageUrl,
                                height: newHeight,
                            });
                        };
                        img.src = imageUrl;
                        onImageUpload(section.id, imageUrl);
                    }
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Failed to upload image:', error);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [section, onImageUpload, onUpdate],
    );

    // Handle resize to proportion
    const handleResizeToProportion = useCallback(() => {
        if (!section.imageUrl || !imageRef.current) return;

        const img = imageRef.current;
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        // If image is too small, enforce minimum size while maintaining aspect ratio
        if (img.naturalWidth < MIN_SECTION_SIZE || img.naturalHeight < MIN_SECTION_SIZE) {
            // Calculate new dimensions that maintain aspect ratio and meet minimum size
            let newWidth = Math.max(MIN_SECTION_SIZE, img.naturalWidth);
            let newHeight = newWidth / aspectRatio;

            // If height is still too small, base it on height instead
            if (newHeight < MIN_SECTION_SIZE) {
                newHeight = MIN_SECTION_SIZE;
                newWidth = newHeight * aspectRatio;
            }

            onUpdate({
                ...section,
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            });
        }
        // If image is smaller than current width but larger than minimum, resize to actual size
        else if (img.naturalWidth < section.width) {
            onUpdate({
                ...section,
                width: Math.max(MIN_SECTION_SIZE, img.naturalWidth),
                height: Math.max(MIN_SECTION_SIZE, img.naturalHeight),
            });
        } else {
            // Otherwise just adjust height to maintain proportion
            const newHeight = section.width / aspectRatio;
            onUpdate({
                ...section,
                height: Math.max(MIN_SECTION_SIZE, newHeight),
            });
        }
    }, [section, onUpdate]);

    return (
        <div
            {...bindDrag()}
            className={cn(
                'absolute p-1',
                'border-2 border-dashed border-gray-300 hover:border-docmosaic-purple/50',
                'rounded-lg overflow-visible group touch-none',
                isSelected && 'border-solid border-docmosaic-purple shadow-lg',
                isDroppingFile && 'border-docmosaic-purple border-solid bg-docmosaic-purple/5',
                isDragging && 'opacity-50 cursor-grabbing',
                isResizing && 'pointer-events-none',
            )}
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
        >
            {/* Resize handles - always show on hover */}
            <ResizeHandles onResizeStart={handleResizeStart} />

            {/* Top menu - show on hover or when selected */}
            <div
                className={cn(
                    'absolute -top-12 right-0 flex gap-1 bg-white rounded-lg shadow-md p-1 z-50',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    isSelected && 'opacity-100', // Always show when selected
                )}
            >
                {section.imageUrl && (
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleResizeToProportion}
                        className="h-8 w-8 hover:bg-gray-100"
                        title="Fit to image proportion"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section);
                    }}
                    className="h-8 w-8 hover:bg-gray-100"
                >
                    <Copy className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(section.id);
                    }}
                    className="h-8 w-8 hover:bg-red-50 text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Image container */}
            <div className="relative w-full h-full group">
                {section.imageUrl ? (
                    <>
                        <Image
                            ref={(el) => {
                                if (el) {
                                    imageRef.current = el;
                                }
                            }}
                            src={section.imageUrl}
                            alt="Section content"
                            className="w-full h-full object-contain"
                            fill
                            unoptimized
                            draggable={false}
                        />
                        {/* Hover overlay with replace button */}
                        <div
                            className={cn(
                                'absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center',
                                'opacity-0 group-hover:opacity-100 transition-opacity',
                                isDroppingFile && 'opacity-100 bg-docmosaic-purple/40',
                            )}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-white/10 hover:bg-white/20 text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                <RefreshCw className="h-4 w-4" />
                                {section.width >= 150 && (
                                    <span className="ml-2">
                                        {isDroppingFile ? 'Drop to Replace' : 'Replace'}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div
                        className={cn(
                            'w-full h-full flex items-center justify-center',
                            'bg-gray-50/50',
                            isDroppingFile && 'bg-docmosaic-purple/5',
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white hover:bg-gray-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            <ImageIcon className="h-4 w-4" />
                            {section.width >= 150 && (
                                <span className="ml-2">
                                    {isDroppingFile ? 'Drop Image Here' : 'Upload Image'}
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Upload progress overlay */}
            {uploadProgress && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                    <div className="w-full max-w-xs px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {uploadProgress.message}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {Math.round(uploadProgress.progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
