'use client';

import type { ImageSection } from '@docmosaic/core';
import { useCallback, useRef, useState } from 'react';
import { cn } from '../../internal/utils';
import { SectionEmptyState } from './section-empty-state';
import { SectionImage } from './section-image';
import { SectionResizeHandles } from './section-resize-handles';
import { SectionToolbar } from './section-toolbar';
import { SectionUploadProgress } from './section-upload-progress';
import { useImageUpload } from './use-image-upload';
import { useSectionDrag } from './use-section-drag';
import { useSectionResize } from './use-section-resize';

interface ImageSectionProps {
    section: ImageSection;
    isSelected: boolean;
    onUpdate: (section: ImageSection) => void;
    onImageUpload: (sectionId: string, imageUrl: string) => void;
    onDuplicate: (section: ImageSection) => void;
    onDelete: (sectionId: string) => void;
    onClick: (e: React.MouseEvent) => void;
}

/**
 * Orchestrates the resize/drag/upload hooks and the visual parts.
 * State lives in the hooks; this component composes them.
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isDroppingFile, setIsDroppingFile] = useState(false);

    const { isResizing, handleResizeStart, handleResizeToProportion } = useSectionResize({
        section,
        onUpdate,
        imageRef,
    });
    const { bindDrag, isDragging } = useSectionDrag({ section, onUpdate, isResizing });
    const { handleFileDrop, handleImageUpload, uploadProgress } = useImageUpload({
        section,
        onUpdate,
        onImageUpload,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes('Files')) {
            setIsDroppingFile(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDroppingFile(false);
    };

    const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDroppingFile(false);
        const file = e.dataTransfer.files[0];
        if (file) void handleFileDrop(file);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const file = e.target.files?.[0];
        if (file) void handleImageUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openFilePicker = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        fileInputRef.current?.click();
    }, []);

    return (
        <div
            {...bindDrag()}
            data-section="true"
            className={cn(
                'absolute p-1',
                'border-2 border-dashed border-gray-300 hover:border-editor-accent/50',
                'rounded-lg overflow-visible group touch-none pointer-events-auto',
                isSelected && 'border-solid border-editor-accent shadow-lg',
                isDroppingFile && 'border-editor-accent border-solid bg-editor-accent/5',
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
            onDrop={onFileDrop}
        >
            {isSelected && !isResizing && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {isSelected && (
                <div className="absolute inset-0 border-2 border-editor-accent border-dashed pointer-events-none z-5" />
            )}

            <SectionToolbar
                section={section}
                isSelected={isSelected}
                onResizeToProportion={handleResizeToProportion}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />

            <div className="relative w-full h-full group pointer-events-none">
                {section.imageUrl ? (
                    <SectionImage
                        section={section}
                        imageRef={(el) => {
                            if (el) imageRef.current = el;
                        }}
                        isDroppingFile={isDroppingFile}
                        onReplaceClick={openFilePicker}
                    />
                ) : (
                    <SectionEmptyState
                        isDroppingFile={isDroppingFile}
                        onUploadClick={openFilePicker}
                    />
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onInputChange}
                data-section-input="true"
            />

            {uploadProgress && <SectionUploadProgress progress={uploadProgress} />}
        </div>
    );
}
