import { describe, expect, it } from 'vitest';
import { estimatePDFSize } from './pdf';
import type { Section } from './types';

describe('estimatePDFSize', () => {
    it('returns a non-negative finite number for an empty document', () => {
        const size = estimatePDFSize([], []);
        expect(Number.isFinite(size)).toBe(true);
        expect(size).toBeGreaterThanOrEqual(0);
    });

    it('is deterministic for identical input', () => {
        const a = estimatePDFSize([], []);
        const b = estimatePDFSize([], []);
        expect(a).toBe(b);
    });

    it('grows when a section has a base64 image payload', () => {
        const empty = estimatePDFSize([], []);

        const base64Payload = 'A'.repeat(100);
        const section: Section = {
            id: 'test-section',
            imageUrl: `data:image/jpeg;base64,${base64Payload}`,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            page: 1,
        };

        const withImage = estimatePDFSize([section], []);
        expect(withImage).toBeGreaterThan(empty);
    });
});
