/**
 * Deterministic fixture document with a single cropped image section. Locks
 * the {@link ImageCrop} render path against {@link generatePDF}'s byte output.
 *
 * Mirrors the shape of `sample-doc.ts` — fixed ids, fixed timestamps, one
 * tiny embedded PNG — but adds a `crop` to the image section.
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

export const sampleDocCropped: Document = {
    ...base,
    id: 'fixture-doc-cropped-id',
    name: 'Sample Fixture Document (Cropped)',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 1,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [{ id: 'fixture-page-1', sections: [], backgroundPDF: null }],
    sections: [
        {
            id: 'fixture-section-cropped',
            type: 'image',
            x: 40,
            y: 40,
            width: 200,
            height: 150,
            page: 1,
            imageUrl: TINY_PNG,
            zIndex: 0,
            crop: { x: 25, y: 20, width: 100, height: 80 },
        },
    ],
};
