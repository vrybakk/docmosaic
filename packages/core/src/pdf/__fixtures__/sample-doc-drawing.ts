/**
 * Deterministic drawing-only fixture for the PDF byte-diff gate.
 *
 * Carries a single {@link DrawingSection} with two strokes — one quick zigzag
 * in red, one slower curve in blue — so the {@link drawDrawingSection} branch
 * is exercised end-to-end (multiple strokes, distinct colors and weights,
 * varying point counts). Ids and timestamps are hard-coded — never use
 * `uuidv4` or `new Date()` here.
 *
 * @packageDocumentation
 */

import { createDocument } from '../../factories';
import type { Document } from '../../types';

const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

const base = createDocument();

export const sampleDrawingDoc: Document = {
    ...base,
    id: 'fixture-drawing-doc-id',
    name: 'Sample Drawing Fixture Document',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    totalPages: 1,
    currentPage: 1,
    pageSize: 'A4',
    orientation: 'portrait',
    pages: [
        {
            id: 'fixture-drawing-page-1',
            sections: [],
            backgroundPDF: null,
        },
    ],
    sections: [
        {
            id: 'fixture-drawing-section-1',
            type: 'drawing',
            x: 72,
            y: 72,
            width: 400,
            height: 300,
            page: 1,
            zIndex: 0,
            strokes: [
                {
                    color: '#c97b22',
                    weight: 3,
                    points: [
                        { x: 80, y: 90 },
                        { x: 120, y: 140 },
                        { x: 160, y: 100 },
                        { x: 200, y: 150 },
                        { x: 240, y: 110 },
                    ],
                },
                {
                    color: '#3b6e3b',
                    weight: 2,
                    points: [
                        { x: 100, y: 220 },
                        { x: 140, y: 200 },
                        { x: 180, y: 230 },
                        { x: 220, y: 210 },
                    ],
                },
            ],
        },
    ],
};
