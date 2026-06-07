/**
 * Deterministic fixture for the "hidden-section omission" byte-diff gate.
 *
 * Mirrors the shapes fixture (rect + circle + text + image on page 1) but
 * adds a fifth section explicitly marked `hidden: true`. The PDF generator
 * is expected to skip it entirely — the resulting bytes match a 4-section
 * render. Ids, timestamps, and geometry are hard-coded so the diff stays
 * stable.
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

export const sampleHiddenDoc: Document = {
    ...base,
    id: 'fixture-hidden-doc-id',
    name: 'Sample Hidden Fixture Document',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 1,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [
        {
            id: 'fixture-hidden-page-1',
            sections: [],
            backgroundPDF: null,
        },
    ],
    sections: [
        {
            id: 'fixture-hidden-rect',
            type: 'shape',
            shape: 'rect',
            x: 72,
            y: 72,
            width: 200,
            height: 120,
            page: 1,
            zIndex: 0,
            fill: '#fff7e6',
            stroke: '#c97b22',
            strokeWidth: 2,
            opacity: 1,
        },
        // This circle is hidden — the generator must skip it. If the fixture
        // ever drifts (e.g. someone removes the hidden filter), the diff
        // breaks loudly because the circle's draw calls show up in the byte
        // stream.
        {
            id: 'fixture-hidden-circle',
            type: 'shape',
            shape: 'circle',
            x: 320,
            y: 80,
            width: 160,
            height: 160,
            page: 1,
            zIndex: 1,
            fill: 'transparent',
            stroke: '#3b6e3b',
            strokeWidth: 3,
            opacity: 1,
            hidden: true,
        },
        {
            id: 'fixture-hidden-text',
            type: 'text',
            x: 72,
            y: 320,
            width: 420,
            height: 60,
            page: 1,
            zIndex: 2,
            text: 'Hidden fixture',
            fontSize: 18,
            fontWeight: 'bold',
            color: 'rgb(40,40,40)',
            align: 'left',
            lineHeight: 1.2,
        },
        {
            id: 'fixture-hidden-image',
            type: 'image',
            x: 72,
            y: 400,
            width: 120,
            height: 120,
            page: 1,
            zIndex: 3,
            imageUrl: TINY_PNG,
        },
    ],
};

/**
 * Control fixture — same document with the hidden section removed entirely.
 * Used by the test to confirm the byte stream is identical to dropping the
 * section, not just hiding it.
 */
export const sampleHiddenDocControl: Document = {
    ...sampleHiddenDoc,
    sections: sampleHiddenDoc.sections.filter((s) => s.id !== 'fixture-hidden-circle'),
};
