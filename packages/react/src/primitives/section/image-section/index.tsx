'use client';

import type { ImageSection as ImageSectionData, Section } from '@docmosaic/core';
import { useCallback, useRef, useState } from 'react';
import { useEditor, useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import { useSectionResize } from '../hooks/use-section-resize';
import { SectionCropOverlay } from './section-crop-overlay';
import { SectionEmptyState } from './section-empty-state';
import { SectionImage } from './section-image';
import { SectionToolbar } from './section-toolbar';
import { SectionUploadProgress } from './section-upload-progress';
import { useImageCrop } from './use-image-crop';
import { useImageUpload } from './use-image-upload';

/**
 * Image-variant section view. Rendered by the {@link Section} dispatcher
 * when `section.type === 'image'`. Owns its own drag/resize/upload hooks
 * and reads the section + handlers from {@link useEditorSection}.
 */
export function ImageSectionView() {
    const editor = useEditorSection();
    const section = editor.section as ImageSectionData;
    const rawSection = editor.rawSection as ImageSectionData;
    const {
        isSelected,
        onClick,
        onUpdate,
        onImageUpload,
        onDuplicate,
        onDelete,
        onBringToFront,
        onSendToBack,
        onMoveForward,
        onMoveBackward,
        groupDrag,
        finalScale,
        readOnly,
    } = editor;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [isDroppingFile, setIsDroppingFile] = useState(false);

    const { isResizing, handleResizeStart, handleResizeToProportion } = useSectionResize({
        section,
        onUpdate,
        imageRef,
    });
    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        // While readOnly, treat the section as "resizing" — the drag hook
        // short-circuits and never fires `onUpdate`. Resize handles are not
        // rendered, so the resize hook itself is never armed.
        isResizing: isResizing || readOnly,
        groupDrag,
    });
    const { handleFileDrop, handleImageUpload, uploadProgress } = useImageUpload({
        section,
        onUpdate,
        onImageUpload,
    });
    // Crop edits use raw (un-scaled) section coords directly — the standard
    // `onUpdate` wrapper divides geometry by `finalScale`, which would corrupt
    // a fresh crop update that was already authored in raw points. Route the
    // crop write through `actions.updateSection` to skip that conversion.
    const { actions } = useEditor();
    const onCropUpdate = useCallback((next: Section) => actions.updateSection(next), [actions]);
    const {
        isCropping,
        draft,
        enterCropMode,
        confirmCrop,
        cancelCrop,
        startMove: startCropMove,
        startResize: startCropResize,
    } = useImageCrop({
        section: rawSection,
        onUpdate: onCropUpdate,
        scale: finalScale,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(e);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        // Double-click on an image with content enters crop mode; on an empty
        // section it falls through (no-op) so the placeholder's upload prompt
        // stays primary.
        if (!rawSection.imageUrl) return;
        e.stopPropagation();
        if (!isCropping) enterCropMode();
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.types.includes('Files')) {
            setIsDroppingFile(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDroppingFile(false);
    };

    const onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (readOnly) return;
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

    const openFilePicker = useCallback(
        (e: React.MouseEvent) => {
            if (readOnly) return;
            e.stopPropagation();
            e.preventDefault();
            fileInputRef.current?.click();
        },
        [readOnly],
    );

    return (
        <div
            {...(readOnly ? {} : bindDrag())}
            data-section="true"
            data-section-id={section.id}
            className={cn(
                'absolute p-1',
                'border-2 border-dashed border-gray-300 hover:border-primary/50',
                'rounded-lg overflow-visible group touch-none pointer-events-auto',
                isSelected && 'border-solid border-primary shadow-lg',
                isDroppingFile && 'border-primary border-solid bg-primary/5',
                isDragging && 'opacity-50 cursor-grabbing',
                isResizing && 'pointer-events-none',
            )}
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                // Mirror the PDF render order on-canvas so the editor preview
                // matches export. Selected sections jump on top via the +1000
                // offset so resize handles and the toolbar remain interactable.
                zIndex: (section.zIndex ?? 0) + (isSelected ? 1000 : 0),
                cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
            }}
            onClick={handleClick}
            onDoubleClick={readOnly ? undefined : handleDoubleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={onFileDrop}
        >
            {isSelected && !isResizing && !isCropping && !readOnly && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {isSelected && (
                <div className="absolute inset-0 border-2 border-primary border-dashed pointer-events-none z-5" />
            )}

            {!readOnly && (
                <SectionToolbar
                    section={section}
                    isSelected={isSelected}
                    onResizeToProportion={handleResizeToProportion}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onBringToFront={onBringToFront}
                    onSendToBack={onSendToBack}
                    onMoveForward={onMoveForward}
                    onMoveBackward={onMoveBackward}
                />
            )}

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

            {isCropping && draft && !readOnly && (
                <SectionCropOverlay
                    sectionWidth={rawSection.width}
                    sectionHeight={rawSection.height}
                    crop={draft}
                    scale={finalScale}
                    onStartMove={startCropMove}
                    onStartResize={startCropResize}
                    onConfirm={confirmCrop}
                    onCancel={cancelCrop}
                />
            )}
        </div>
    );
}
