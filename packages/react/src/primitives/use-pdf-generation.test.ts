/**
 * @vitest-environment happy-dom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generatePDFMock = vi.fn();

vi.mock('@docmosaic/core', async () => {
    const actual = await vi.importActual<typeof import('@docmosaic/core')>('@docmosaic/core');
    return {
        ...actual,
        generatePDF: (...args: unknown[]) => generatePDFMock(...args),
        estimatePDFSize: () => 0,
    };
});

import type { PDFDocument } from '@docmosaic/core';
import { usePdfGeneration } from './use-pdf-generation';

function makeDocument(): PDFDocument {
    return {
        id: 'doc-1',
        name: 'Untitled',
        pageSize: 'A4',
        orientation: 'portrait',
        currentPage: 1,
        lastModified: new Date(0),
        pages: [{ id: 'p1', backgroundPDF: undefined }],
        sections: [],
    } as unknown as PDFDocument;
}

beforeEach(() => {
    generatePDFMock.mockReset();
    // Default: never resolves so tests can drive the lifecycle explicitly.
    generatePDFMock.mockImplementation(() => new Promise(() => {}));
    if (typeof URL.createObjectURL !== 'function') {
        (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = () =>
            'blob:test';
    }
    if (typeof URL.revokeObjectURL !== 'function') {
        (URL as unknown as { revokeObjectURL: (u: string) => void }).revokeObjectURL = () => {};
    }
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('usePdfGeneration', () => {
    it('abort() cancels in-flight download and surfaces cancelled state', async () => {
        let capturedSignal: AbortSignal | undefined;
        generatePDFMock.mockImplementation(
            (_sections: unknown, options: { signal?: AbortSignal }) => {
                capturedSignal = options.signal;
                return new Promise((_resolve, reject) => {
                    options.signal?.addEventListener('abort', () => {
                        reject(new Error('PDF generation cancelled'));
                    });
                });
            },
        );

        const { result } = renderHook(() => usePdfGeneration({ document: makeDocument() }));

        act(() => {
            void result.current.download();
        });

        await waitFor(() => {
            expect(result.current.state.isGenerating).toBe(true);
        });
        expect(capturedSignal).toBeDefined();

        act(() => result.current.abort());

        await waitFor(() => {
            expect(result.current.state.isGenerating).toBe(false);
        });
        expect(result.current.state.error).toBe('PDF generation cancelled.');
        expect(capturedSignal?.aborted).toBe(true);
    });

    it('progress callback wires optimizing 30% and generating 70% into state', async () => {
        let onProgress:
            | ((p: { progress: number; stage: 'optimizing' | 'generating' | 'complete' }) => void)
            | undefined;
        generatePDFMock.mockImplementation(
            (
                _sections: unknown,
                _options: unknown,
                progress: (p: {
                    progress: number;
                    stage: 'optimizing' | 'generating' | 'complete';
                }) => void,
            ) => {
                onProgress = progress;
                return new Promise(() => {});
            },
        );

        const { result } = renderHook(() => usePdfGeneration({ document: makeDocument() }));

        act(() => {
            void result.current.download();
        });

        await waitFor(() => expect(onProgress).toBeDefined());

        act(() => onProgress!({ progress: 30, stage: 'optimizing' }));
        await waitFor(() => {
            expect(result.current.state.progress).toBe(30);
            expect(result.current.state.stage).toBe('optimizing');
        });

        act(() => onProgress!({ progress: 70, stage: 'generating' }));
        await waitFor(() => {
            expect(result.current.state.progress).toBe(70);
            expect(result.current.state.stage).toBe('generating');
        });
    });

    it('successful download calls onSizeKnown with blob size (analytics fired by generatePDF wrapper)', async () => {
        const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
        generatePDFMock.mockResolvedValue(blob);

        // Render the hook first, THEN install DOM stubs so React's mount succeeds.
        const onSizeKnown = vi.fn();
        const { result } = renderHook(() =>
            usePdfGeneration({ document: makeDocument(), onSizeKnown }),
        );

        const click = vi.fn();
        const realCreateElement = globalThis.document.createElement.bind(globalThis.document);
        const createElement = vi
            .spyOn(globalThis.document, 'createElement')
            .mockImplementation((tag: string) => {
                if (tag === 'a') {
                    return { click, style: {}, href: '', download: '' } as unknown as HTMLElement;
                }
                return realCreateElement(tag);
            });
        const appendChild = vi
            .spyOn(globalThis.document.body, 'appendChild')
            .mockImplementation((node: Node) => node);
        const removeChild = vi
            .spyOn(globalThis.document.body, 'removeChild')
            .mockImplementation((node: Node) => node);

        await act(async () => {
            await result.current.download();
        });

        expect(generatePDFMock).toHaveBeenCalledTimes(1);
        expect(onSizeKnown).toHaveBeenCalledWith(blob.size);
        expect(click).toHaveBeenCalledTimes(1);
        expect(result.current.state.isGenerating).toBe(false);

        appendChild.mockRestore();
        removeChild.mockRestore();
        createElement.mockRestore();
    });
});
