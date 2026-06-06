/**
 * Deterministic fixture document used by the PDF byte-diff gate.
 *
 * Locks layout, page sizes, and one base64 image so PDF output stays stable.
 * Ids, timestamps, and section geometry are hard-coded — never use
 * `uuidv4` or `new Date()` here.
 *
 * @packageDocumentation
 */

import { createDocument } from '../../factories';
import type { Document } from '../../types';

/** 1x1 transparent PNG, kept tiny so the rendered PDF stays small. */
const TINY_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

const base = createDocument();

export const sampleDoc: Document = {
    ...base,
    id: 'fixture-doc-id',
    name: 'Sample Fixture Document',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 2,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [
        { id: 'fixture-page-1', sections: [], backgroundPDF: null },
        { id: 'fixture-page-2', sections: [], backgroundPDF: null },
    ],
    sections: [
        {
            id: 'fixture-section-1',
            x: 36,
            y: 36,
            width: 200,
            height: 150,
            page: 1,
            imageUrl: TINY_PNG,
        },
        {
            id: 'fixture-section-2',
            x: 260,
            y: 220,
            width: 180,
            height: 240,
            page: 1,
        },
        {
            id: 'fixture-section-3',
            x: 72,
            y: 100,
            width: 300,
            height: 200,
            page: 2,
        },
    ],
};
