'use client';

import { generatePDF } from '@/lib/pdf';
import type { PDFDocument } from '@/lib/pdf-editor/types';
import { getDownloadFileName } from '@/lib/pdf-editor/utils/document';
import { useCallback, useRef, useState } from 'react';

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
}

interface UsePdfGenerationResult {
    state: GenerationState;
    download: () => Promise<void>;
    print: () => Promise<void>;
    abort: () => void;
    dismissError: () => void;
}

/**
 * Owns the in-flight PDF generation lifecycle: AbortController wiring,
 * download blob URL plumbing, print-window handoff, and progress state.
 *
 * Analytics for `documentGenerated` is already fired inside `generatePDF`
 * (see `apps/web/src/lib/pdf.ts`), so this hook intentionally does not
 * call `trackEvent.documentGenerated` itself.
 */
export function usePdfGeneration({
    document,
    onSizeKnown,
}: UsePdfGenerationArgs): UsePdfGenerationResult {
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

            const blob = await generatePDF(
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
    }, [document, onSizeKnown]);

    const print = useCallback(async () => {
        try {
            setState({ isGenerating: true, stage: 'optimizing', progress: 0 });

            const blob = await generatePDF(
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

            setState({ isGenerating: false });
        } catch (error) {
            console.error('Error printing PDF:', error);
            setState({
                isGenerating: false,
                error: 'Failed to print PDF. Please try again.',
            });
        }
    }, [document]);

    return { state, download, print, abort, dismissError };
}
