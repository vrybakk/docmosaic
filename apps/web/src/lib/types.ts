export interface Section {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    imageUrl?: string;
    page: number;
}

export interface Page {
    id: string;
    sections: Section[];
    backgroundPDF: string | null;
}

export type PageSize =
    | 'A0'
    | 'A1'
    | 'A2'
    | 'A3'
    | 'A4'
    | 'A5'
    | 'B4'
    | 'B5'
    | 'LETTER'
    | 'LEGAL'
    | 'TABLOID'
    | 'EXECUTIVE'
    | 'STATEMENT'
    | 'FOLIO';

export type PageOrientation = 'portrait' | 'landscape';

export type MeasurementUnit = 'mm' | 'in' | 'px';

export interface PageDimensions {
    width: number;
    height: number;
    unit: MeasurementUnit;
}

export interface PDFDocument {
    id: string;
    name: string;
    sections: Section[];
    createdAt: Date;
    updatedAt: Date;
    backgroundPDF: string | null;
    totalPages: number;
    currentPage: number;
    estimatedSize: number;
    pageSize: PageSize;
    orientation: PageOrientation;
    pages: Page[];
}

export interface DragPosition {
    x: number;
    y: number;
}

export interface ResizeInfo {
    id: string;
    handle: 'right' | 'bottom' | 'bottomRight';
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
}

export interface PDFGenerationOptions {
    pageSize: PageSize;
    orientation: PageOrientation;
    pages: Page[];
    preview?: boolean;
}
