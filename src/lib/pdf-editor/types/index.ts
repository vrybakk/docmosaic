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

export interface ImageSection {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    imageUrl?: string;
}

export interface Page {
    id: string;
    sections: ImageSection[];
    backgroundPDF: string | null;
}

export interface PDFDocument {
    id: string;
    name: string;
    sections: ImageSection[];
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

export interface PageDimensions {
    width: number;
    height: number;
}
