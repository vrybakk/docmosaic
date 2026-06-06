import type { Section } from '@docmosaic/core';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface UploadProgressInfo {
    status: 'reading' | 'processing' | 'resizing' | 'complete' | 'error';
    progress: number;
    message: string;
}

export type FileValidationError = 'invalid-type' | 'too-large' | null;

/**
 * Pure file validator. Returns `null` if the file is acceptable, otherwise an
 * error tag. Exported for unit tests.
 */
export function validateImageFile(file: File): FileValidationError {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
        return 'invalid-type';
    }
    if (file.size > MAX_FILE_SIZE) {
        return 'too-large';
    }
    return null;
}

interface UseImageUploadArgs {
    section: Section;
    onUpdate: (section: Section) => void;
    onImageUpload: (sectionId: string, imageUrl: string) => void;
}

/**
 * Owns drag-drop and file-input image upload, plus progress bookkeeping.
 * Mirrors the pre-extraction inline behaviour: a drop runs the
 * read/process/resize pipeline through a `<canvas>`; the file-input fast path
 * just reads the file and adjusts section height to keep aspect ratio.
 */
export function useImageUpload({ section, onUpdate, onImageUpload }: UseImageUploadArgs) {
    const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null);

    const handleFileDrop = useCallback(
        async (file: File) => {
            const validation = validateImageFile(file);
            if (validation === 'invalid-type') {
                toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
                return;
            }
            if (validation === 'too-large') {
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

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Could not get canvas context');
                    }

                    const aspectRatio = img.width / img.height;
                    const targetWidth = section.width;
                    const targetHeight = section.width / aspectRatio;

                    onUpdate({
                        ...section,
                        height: Math.round(targetHeight),
                    });

                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    setUploadProgress({
                        status: 'complete',
                        progress: 100,
                        message: 'Upload complete!',
                    });

                    const base64 = canvas.toDataURL(file.type);
                    onImageUpload(section.id, base64);

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
        },
        [section, onUpdate, onImageUpload],
    );

    const handleImageUpload = useCallback(
        async (file: File) => {
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
            }
        },
        [section, onUpdate, onImageUpload],
    );

    return {
        handleFileDrop,
        handleImageUpload,
        uploadProgress,
    };
}
