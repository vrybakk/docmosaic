/**
 * Smoke gate for the PNG export pipeline. happy-dom doesn't ship a real canvas
 * backend, so we stub the bits {@link generatePNGs} reaches into and assert on
 * the resulting shape, not on pixel data.
 *
 * What we *do* lock down:
 * 1. One Blob is returned per page.
 * 2. Each Blob is non-zero bytes.
 * 3. Each Blob's first bytes are the PNG signature.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDocument, createPage, createSection } from '../factories';
import type { ImageSection, Section } from '../types';
import { generatePNGs } from './png';

/**
 * The stubbed 2D context, re-created per test in `beforeEach`. Hoisted to module
 * scope so save/restore-balance assertions can read the spy call counts.
 */
let ctx: {
    save: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    [key: string]: unknown;
};

const PNG_SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Minimal PNG bytes for an empty 1×1 image. We hand this back from the stubbed
 * `convertToBlob` so the test asserts on a real signature without spinning up
 * an actual canvas rasterizer.
 */
const TINY_PNG_BYTES = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
]);

beforeEach(() => {
    ctx = new Proxy(
        {
            scale: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            ellipse: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 })),
            drawImage: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            font: '',
            textAlign: 'left',
            textBaseline: 'top',
            globalAlpha: 1,
        },
        {
            get(target, prop) {
                if (prop in target) return (target as Record<string | symbol, unknown>)[prop];
                return () => undefined;
            },
            set(target, prop, value) {
                (target as Record<string | symbol, unknown>)[prop] = value;
                return true;
            },
        },
    ) as typeof ctx;

    // Stub OffscreenCanvas globally so the canvas factory hits the same path
    // regardless of test runtime.
    class StubOffscreenCanvas {
        width: number;
        height: number;
        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
        }
        getContext() {
            return ctx;
        }
        async convertToBlob() {
            return new Blob([TINY_PNG_BYTES], { type: 'image/png' });
        }
    }
    (globalThis as unknown as { OffscreenCanvas: typeof StubOffscreenCanvas }).OffscreenCanvas =
        StubOffscreenCanvas;
    // createImageBitmap is awaited by the image loader; return a small ImageBitmap-ish object.
    (globalThis as unknown as { createImageBitmap?: () => Promise<unknown> }).createImageBitmap =
        async () => ({ width: 1, height: 1, close: () => undefined });
});

describe('generatePNGs', () => {
    it('returns one PNG Blob per page', async () => {
        const base = createDocument();
        const doc = {
            ...base,
            pages: [base.pages[0], createPage(), createPage()],
            totalPages: 3,
        };

        const blobs = await generatePNGs(doc.sections, {
            pageSize: doc.pageSize,
            orientation: doc.orientation,
            pages: doc.pages,
        });

        expect(blobs).toHaveLength(3);
    });

    it('each Blob has non-zero size and the PNG signature', async () => {
        const doc = createDocument();

        const blobs = await generatePNGs(doc.sections, {
            pageSize: doc.pageSize,
            orientation: doc.orientation,
            pages: doc.pages,
        });

        for (const blob of blobs) {
            expect(blob.size).toBeGreaterThan(0);
            expect(blob.type).toBe('image/png');
            const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
            for (let i = 0; i < PNG_SIGNATURE.length; i++) {
                expect(head[i]).toBe(PNG_SIGNATURE[i]);
            }
        }
    });

    it('reports progress and completes', async () => {
        const doc = createDocument();
        const progress: number[] = [];
        await generatePNGs(
            doc.sections,
            {
                pageSize: doc.pageSize,
                orientation: doc.orientation,
                pages: doc.pages,
            },
            (p) => progress.push(p.progress),
        );
        expect(progress[progress.length - 1]).toBe(100);
    });

    it('throws when aborted', async () => {
        const doc = createDocument();
        const controller = new AbortController();
        controller.abort();
        await expect(
            generatePNGs(doc.sections, {
                pageSize: doc.pageSize,
                orientation: doc.orientation,
                pages: doc.pages,
                signal: controller.signal,
            }),
        ).rejects.toThrow(/cancelled/);
    });

    /** Build a single-page doc whose only section is the given image. */
    function imageSection(extra: Partial<ImageSection>): ImageSection {
        return {
            ...(createSection({ type: 'image' }) as ImageSection),
            imageUrl: 'data:image/png;base64,AAAA',
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            ...extra,
        };
    }

    it('balances ctx.save/restore for a circle-masked image so the clip never leaks', async () => {
        const doc = createDocument();
        await generatePNGs([imageSection({ maskShape: 'circle' })] as Section[], {
            pageSize: doc.pageSize,
            orientation: doc.orientation,
            pages: doc.pages,
        });
        // A circle mask pushes a clip; it must be popped, or every later section
        // on the shared page canvas would be clipped to the ellipse.
        expect(ctx.save.mock.calls.length).toBeGreaterThan(0);
        expect(ctx.save.mock.calls.length).toBe(ctx.restore.mock.calls.length);
    });

    it('issues no save/restore for an unmasked image (legacy draw path untouched)', async () => {
        const doc = createDocument();
        await generatePNGs([imageSection({})] as Section[], {
            pageSize: doc.pageSize,
            orientation: doc.orientation,
            pages: doc.pages,
        });
        expect(ctx.save).not.toHaveBeenCalled();
        expect(ctx.restore).not.toHaveBeenCalled();
    });
});
