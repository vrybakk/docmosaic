export interface ImageSection {
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
  sections: ImageSection[];
  backgroundPDF: string | null;
}

export type PageSize =
  // ISO A Series
  | 'A3'
  | 'A4'
  | 'A5'
  // ISO B Series
  | 'B4'
  | 'B5'
  // North American
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

export interface DragPosition {
  x: number;
  y: number;
}

export interface ResizeInfo {
  id: string;
  handle: 'right' | 'bottom' | 'bottomRight';
}
