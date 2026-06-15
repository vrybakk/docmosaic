/**
 * Deterministic fixture document used by the Phase 29 guides byte-diff gate.
 *
 * Mirrors {@link sampleDoc} section-for-section but adds a handful of
 * `Page.guides` to the first page. Guides are an editor-only construct —
 * they're never drawn into the PDF output — so this fixture must produce
 * the exact same bytes as `sample-doc.pdf.bin`.
 *
 * Hard-coded ids and dates so the gate stays stable across runs.
 *
 * @packageDocumentation
 */

import { createDocument } from '../../factories';
import type { Document } from '../../types';

const TINY_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

const base = createDocument();

export const sampleDocWithGuides: Document = {
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
        {
            id: 'fixture-page-1',
            sections: [],
            backgroundPDF: null,
            guides: { vertical: [100, 300], horizontal: [200] },
        },
        { id: 'fixture-page-2', sections: [], backgroundPDF: null },
    ],
    sections: [
        {
            id: 'fixture-section-1',
            type: 'image',
            x: 36,
            y: 36,
            width: 200,
            height: 150,
            page: 1,
            imageUrl: TINY_PNG,
            zIndex: 0,
        },
        {
            id: 'fixture-section-2',
            type: 'image',
            x: 260,
            y: 220,
            width: 180,
            height: 240,
            page: 1,
            zIndex: 0,
        },
        {
            id: 'fixture-section-3',
            type: 'image',
            x: 72,
            y: 100,
            width: 300,
            height: 200,
            page: 2,
            zIndex: 0,
        },
    ],
};
