'use client';

import {
    estimatePDFSize as defaultEstimatePDFSize,
    generatePDF as defaultGeneratePDF,
    type PDFDocument,
} from '@docmosaic/core';
import { useCallback, useRef, useState } from 'react';
import type { EditorPdfBackend } from '../context/editor';
import { trackEvent } from '../internal/analytics';
import { getDownloadFileName } from '../internal/download';

export interface GenerationState {
    isGenerating: boolean;
    progress?: number;
    stage?: 'optimizing' | 'generating' | 'complete';
    error?: string;
}

interface UsePdfGenerationArgs {
    /** Current editor document. Read at call time of download/print. */
    document: PDFDocument;
    /** Called with the generated blob's size once download completes. */
    onSizeKnown?: (bytes: number) => void;
    /**
     * Optional PDF backend override. Defaults to `@docmosaic/core` exports.
     * Use this to swap the bundled jsPDF path for a custom implementation.
     */
    backend?: Partial<EditorPdfBackend>;
}

interface UsePdfGenerationResult {
    state: GenerationState;
    download: () => Promise<void>;
    print: () => Promise<void>;
    abort: () => void;
    dismissError: () => void;
}

function fireDocumentGeneratedEvent(
    document: PDFDocument,
    blob: Blob,
    estimate: EditorPdfBackend['estimate'],
) {
    const estimated = estimate(
        document.sections,
        document.pages.map((page) => page.backgroundPDF),
    );
    const imageCount = document.sections.filter((section) => section.imageUrl).length;
    trackEvent.documentGenerated({
        totalPages: document.pages.length,
        totalImages: imageCount,
        averageImagesPerPage: Math.round(imageCount / document.pages.length),
        format: document.pageSize,
        orientation: document.orientation,
        fileSize: Math.round(blob.size / 1024),
        estimatedSize: Math.round(estimated / 1024),
    });
}

/**
 * Owns the in-flight PDF generation lifecycle: AbortController wiring,
 * download blob URL plumbing, print-window handoff, and progress state.
 *
 * Fires `documentGenerated` analytics after each successful render.
 *
 * The PDF backend (`generate` + `estimate`) is pluggable via the `backend`
 * argument; omitted or partial values fall back to `@docmosaic/core`.
 */
export function usePdfGeneration({
    document,
    onSizeKnown,
    backend,
}: UsePdfGenerationArgs): UsePdfGenerationResult {
    const generate = backend?.generate ?? defaultGeneratePDF;
    const estimate = backend?.estimate ?? defaultEstimatePDFSize;

    const [state, setState] = useState<GenerationState>({ isGenerating: false });
    const abortControllerRef = useRef<AbortController | null>(null);

    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        setState({ isGenerating: false, error: 'PDF generation cancelled.' });
    }, []);

    const dismissError = useCallback(() => {
        setState((prev) => ({ ...prev, error: undefined }));
    }, []);

    const download = useCallback(async () => {
        try {
            abortControllerRef.current = new AbortController();

            setState({ isGenerating: true, stage: 'optimizing', progress: 0 });

            const blob = await generate(
                document.sections,
                {
                    pageSize: document.pageSize,
                    orientation: document.orientation,
                    pages: document.pages,
                    signal: abortControllerRef.current.signal,
                },
                (progress) => setState((prev) => ({ ...prev, ...progress })),
            );

            const url = URL.createObjectURL(blob);

            const link = globalThis.document.createElement('a');
            link.href = url;
            link.download = getDownloadFileName(document.name);
            globalThis.document.body.appendChild(link);
            link.click();

            globalThis.document.body.removeChild(link);
            URL.revokeObjectURL(url);

            fireDocumentGeneratedEvent(document, blob, estimate);
            onSizeKnown?.(blob.size);

            setState({ isGenerating: false });
        } catch (error) {
            console.error('Error generating PDF:', error);
            setState({
                isGenerating: false,
                error:
                    (error as Error).message === 'PDF generation cancelled'
                        ? 'PDF generation cancelled.'
                        : 'Failed to generate PDF. Please try again.',
            });
        } finally {
            abortControllerRef.current = null;
        }
    }, [document, onSizeKnown, generate, estimate]);

    const print = useCallback(async () => {
        try {
            setState({ isGenerating: true, stage: 'optimizing', progress: 0 });

            const blob = await generate(
                document.sections,
                {
                    pageSize: document.pageSize,
                    orientation: document.orientation,
                    pages: document.pages,
                },
                (progress) => setState((prev) => ({ ...prev, ...progress })),
            );

            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                    URL.revokeObjectURL(url);
                };
            }

            fireDocumentGeneratedEvent(document, blob, estimate);
            setState({ isGenerating: false });
        } catch (error) {
            console.error('Error printing PDF:', error);
            setState({
                isGenerating: false,
                error: 'Failed to print PDF. Please try again.',
            });
        }
    }, [document, generate, estimate]);

    return { state, download, print, abort, dismissError };
}
