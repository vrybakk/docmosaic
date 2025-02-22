import { PageSize } from '../types';

type PageSizeOption = { type: 'title'; label: string } | { type: 'option'; value: PageSize };

// Group page sizes by series for organized presentation
const PAGE_SIZE_GROUPS = {
    'ISO A Series': ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
    'ISO B Series': ['B4', 'B5'],
    'North American': ['LETTER', 'LEGAL', 'TABLOID', 'EXECUTIVE', 'STATEMENT', 'FOLIO'],
} as const;

// Generate page size options with section titles and dynamic dimensions
export const PAGE_SIZE_OPTIONS: PageSizeOption[] = Object.entries(PAGE_SIZE_GROUPS).flatMap(
    ([groupTitle, sizes]) => [
        { type: 'title' as const, label: groupTitle },
        ...sizes.map((size) => ({
            type: 'option' as const,
            value: size as PageSize,
        })),
    ],
);

export const DOCMOSAIC_COLORS = {
    cream: '#FCDE9C',
    purple: '#381D2A',
    sage: '#C4D6B0',
    white: '#FFFFFF',
} as const;

export const ORIENTATION_OPTIONS = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
] as const;
