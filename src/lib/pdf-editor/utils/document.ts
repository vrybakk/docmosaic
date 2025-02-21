import { v4 as uuidv4 } from 'uuid';
import { ImageSection, Page, PDFDocument } from '../types';

export function createInitialDocument(): PDFDocument {
    const INITIAL_DATE = new Date();
    return {
        id: uuidv4(),
        name: 'Untitled Document',
        sections: [],
        createdAt: INITIAL_DATE,
        updatedAt: INITIAL_DATE,
        backgroundPDF: null,
        totalPages: 1,
        currentPage: 1,
        estimatedSize: 0,
        pageSize: 'A4',
        orientation: 'portrait',
        pages: [{ id: uuidv4(), sections: [], backgroundPDF: null }],
    };
}

export function calculateEstimatedSize(sections: ImageSection[]): number {
    // Base PDF size (empty document)
    let estimatedSize = 5 * 1024; // 5KB base

    // Add size for each image section
    sections.forEach((section) => {
        if (section.imageUrl) {
            // Extract base64 data
            const base64Length = section.imageUrl.split(',')[1]?.length || 0;
            // Convert base64 to approximate byte size
            const imageSize = Math.ceil((base64Length * 3) / 4);
            estimatedSize += imageSize;
        }
    });

    return estimatedSize;
}

export function getDownloadFileName(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedName = name.trim() || 'Untitled Document';
    return `${sanitizedName} ${timestamp}.pdf`;
}

export function createNewPage(): Page {
    return {
        id: uuidv4(),
        sections: [],
        backgroundPDF: null,
    };
}

export function createNewImageSection(
    x: number = 50,
    y: number = 50,
    page: number = 1,
): ImageSection {
    // Initial size in pixels, accounting for the fact that it will be converted to points (72/96)
    // and that we want it to be roughly 1/6 of the page width
    const initialSize = 75; // Initial size in pixels (will be ~56 points after 72/96 DPI conversion)
    return {
        id: uuidv4(),
        x,
        y,
        width: initialSize,
        height: initialSize,
        page,
    };
}
