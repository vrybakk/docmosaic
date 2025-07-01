import { v4 as uuidv4 } from 'uuid';
import { Section } from '../../types';
import { ImageSection, Page, PDFDocument } from '../types';

/**
 * Creates a new empty document with default settings
 * Initializes with A4 portrait format and single empty page
 */
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

/**
 * Estimates the size of the final PDF in bytes
 * Accounts for base document size and image data
 */
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

/**
 * Generates a timestamped filename for document download
 * Format: "{document name} YYYY-MM-DD HH-mm.pdf"
 */
export function getDownloadFileName(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const sanitizedName = name.trim() || 'Untitled Document';
    return `${sanitizedName} ${timestamp}.pdf`;
}

/**
 * Creates a new empty page with unique ID
 */
export function createNewPage(): Page {
    return {
        id: uuidv4(),
        sections: [],
        backgroundPDF: null,
    };
}

/**
 * Creates a new image section with default position and size
 * Uses points (72 DPI) as the unit for PDF compatibility
 */
export function createNewImageSection(
    x: number = 50,
    y: number = 50,
    page: number = 1,
): ImageSection {
    // Convert input pixels to points (72 DPI)
    const pxToPoints = (px: number) => px * (72 / 96);
    return {
        id: uuidv4(),
        x: pxToPoints(x),
        y: pxToPoints(y),
        width: 200, // Larger initial size (about 1/3 of A4 width)
        height: 200, // Square aspect ratio initially
        page,
    };
}

/**
 * Creates a new text section with default properties
 * Positions the section at the center of the page
 */
export function createTextSection(
    page: number,
    x: number = 100,
    y: number = 100,
    width: number = 200,
    height: number = 60,
): Section {
    return {
        id: uuidv4(),
        x,
        y,
        width,
        height,
        page,
        type: 'text',
        text: 'Click to edit text',
        fontSize: 14,
        fontFamily: 'helvetica',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textColor: '#000000',
    };
}

/**
 * Creates a new image section with default properties
 * Positions the section at the center of the page
 */
export function createImageSection(
    page: number,
    x: number = 100,
    y: number = 100,
    width: number = 200,
    height: number = 200,
): Section {
    return {
        id: uuidv4(),
        x,
        y,
        width,
        height,
        page,
        type: 'image',
    };
}
