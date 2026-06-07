/**
 * Deterministic shapes-only fixture for the PDF byte-diff gate.
 *
 * Mixes a rectangle, an ellipse, a diagonal line, a text section, and an
 * image alongside a page-level color background — exercises the
 * shape-rendering branch of {@link generatePDF} plus
 * {@link Page.background}. Ids and timestamps are hard-coded — never use
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

export const sampleShapesDoc: Document = {
    ...base,
    id: 'fixture-shapes-doc-id',
    name: 'Sample Shapes Fixture Document',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 1,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [
        {
            id: 'fixture-shapes-page-1',
            sections: [],
            backgroundPDF: null,
            background: { color: '#f5f5f5' },
        },
    ],
    sections: [
        {
            id: 'fixture-shapes-rect',
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
        {
            id: 'fixture-shapes-circle',
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
        },
        {
            id: 'fixture-shapes-line',
            type: 'shape',
            shape: 'line',
            x: 72,
            y: 280,
            width: 420,
            height: 0,
            page: 1,
            zIndex: 2,
            stroke: '#222',
            strokeWidth: 1,
            opacity: 1,
        },
        {
            id: 'fixture-shapes-text',
            type: 'text',
            x: 72,
            y: 320,
            width: 420,
            height: 60,
            page: 1,
            zIndex: 3,
            text: 'Shapes fixture',
            fontSize: 18,
            fontWeight: 'bold',
            color: 'rgb(40,40,40)',
            align: 'left',
            lineHeight: 1.2,
        },
        {
            id: 'fixture-shapes-image',
            type: 'image',
            x: 72,
            y: 400,
            width: 120,
            height: 120,
            page: 1,
            zIndex: 4,
            imageUrl: TINY_PNG,
        },
    ],
};
