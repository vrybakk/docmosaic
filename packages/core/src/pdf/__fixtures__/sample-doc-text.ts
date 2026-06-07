/**
 * Deterministic text-only fixture for the PDF byte-diff gate.
 *
 * Locks layout, font props, and body text so PDF output stays stable across
 * runs. Ids and timestamps are hard-coded — never use `uuidv4` or
 * `new Date()` here.
 *
 * @packageDocumentation
 */

import { createDocument } from '../../factories';
import type { Document } from '../../types';

const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

const base = createDocument();

export const sampleTextDoc: Document = {
    ...base,
    id: 'fixture-text-doc-id',
    name: 'Sample Text Fixture Document',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 1,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [{ id: 'fixture-text-page-1', sections: [], backgroundPDF: null }],
    sections: [
        {
            id: 'fixture-text-section-1',
            type: 'text',
            x: 72,
            y: 72,
            width: 400,
            height: 80,
            page: 1,
            zIndex: 0,
            text: 'Hello DocMosaic',
            fontSize: 24,
            fontWeight: 'bold',
            color: 'rgb(0,0,0)',
            align: 'left',
            lineHeight: 1.2,
        },
        {
            id: 'fixture-text-section-2',
            type: 'text',
            x: 72,
            y: 180,
            width: 400,
            height: 120,
            page: 1,
            zIndex: 0,
            text: 'A second paragraph with longer body text that should wrap across multiple lines inside the section box.',
            fontSize: 12,
            color: 'rgb(0,0,0)',
            align: 'left',
            lineHeight: 1.4,
        },
    ],
};
