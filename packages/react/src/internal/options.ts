import type { PageSize } from '@docmosaic/core';

type PageSizeOption = { type: 'title'; label: string } | { type: 'option'; value: PageSize };

const PAGE_SIZE_GROUPS = {
    'ISO A Series': ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
    'ISO B Series': ['B4', 'B5'],
    'North American': ['LETTER', 'LEGAL', 'TABLOID', 'EXECUTIVE', 'STATEMENT', 'FOLIO'],
} as const;

export const PAGE_SIZE_OPTIONS: PageSizeOption[] = Object.entries(PAGE_SIZE_GROUPS).flatMap(
    ([groupTitle, sizes]) => [
        { type: 'title' as const, label: groupTitle },
        ...sizes.map((size) => ({
            type: 'option' as const,
            value: size as PageSize,
        })),
    ],
);

export const ORIENTATION_OPTIONS = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
] as const;
