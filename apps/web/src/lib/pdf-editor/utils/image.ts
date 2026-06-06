import { ImageSection } from '../types';

/**
 * Optimizes a single image for PDF inclusion
 * - Resizes large images to prevent excessive PDF size
 * - Maintains aspect ratio during resizing
 * - Converts to JPEG format with configurable quality
 * - Uses canvas for smooth scaling
 */
export async function optimizeImageForPDF(
    imageUrl: string,
    options: {
        maxWidth?: number; // Maximum width in pixels
        maxHeight?: number; // Maximum height in pixels
        quality?: number; // JPEG quality (0-1)
        targetDPI?: number; // Target resolution for PDF
    } = {},
): Promise<string> {
    const {
        maxWidth = 2000, // Max width to prevent huge images
        maxHeight = 2000, // Max height to prevent huge images
        quality = 0.85, // Default quality (0.85 is a good balance)
    } = options;

    // Create an image element to load the original image
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
    });

    // Calculate dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    // Create a canvas to draw and optimize the image
    const canvas = globalThis.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to optimized data URL
    return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Batch processes all image sections for PDF generation
 * - Optimizes each image in parallel
 * - Reports progress through callback
 * - Preserves original sections if optimization fails
 * - Doubles dimensions for retina display support
 */
export async function processImagesForPDF(
    sections: ImageSection[],
    onProgress?: (progress: number) => void,
): Promise<ImageSection[]> {
    const sectionsWithImages = sections.filter((section) => section.imageUrl);
    const totalImages = sectionsWithImages.length;
    let processedImages = 0;

    const processedSections = await Promise.all(
        sections.map(async (section) => {
            if (!section.imageUrl) return section;

            try {
                const optimizedImageUrl = await optimizeImageForPDF(section.imageUrl, {
                    // Calculate max dimensions based on section size
                    maxWidth: Math.ceil(section.width * 2), // 2x for retina
                    maxHeight: Math.ceil(section.height * 2), // 2x for retina
                    quality: 0.85,
                });

                processedImages++;
                onProgress?.(Math.round((processedImages / totalImages) * 100));

                return {
                    ...section,
                    imageUrl: optimizedImageUrl,
                };
            } catch (error) {
                console.error('Error optimizing image:', error);
                processedImages++;
                onProgress?.(Math.round((processedImages / totalImages) * 100));
                return section;
            }
        }),
    );

    return processedSections;
}
