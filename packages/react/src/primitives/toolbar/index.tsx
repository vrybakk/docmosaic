'use client';

import { Children, type ReactNode } from 'react';
import { useEditor } from '../../context/editor';
import { Button } from '../../ui/button';
import { DownloadButton } from './download-button';
import { FileSizeBadge } from './file-size-badge';
import { GenerationProgress } from './generation-progress';
import { PreviewButton } from './preview-button';
import { PrintButton } from './print-button';
import { RedoButton } from './redo-button';
import { UndoButton } from './undo-button';

interface ToolbarProps {
    /**
     * Optional children. When provided, the toolbar renders the inverse
     * default layout and shows whatever children the caller passes.
     * When omitted, falls back to the bundled default layout — the same
     * arrangement the editor has always shipped with.
     */
    children?: ReactNode;
}

/**
 * Default toolbar layout for the PDF editor.
 *
 * Reads all of its state from {@link useEditor} and composes the standalone
 * action buttons. Pass children to override the layout entirely.
 */
export function Toolbar({ children }: ToolbarProps = {}) {
    const { pdfApi } = useEditor();
    const { state, dismissError } = pdfApi;
    const { error, isGenerating } = state;

    if (children !== undefined && Children.count(children) > 0) {
        return <div className="border-b bg-white p-4">{children}</div>;
    }

    return (
        <div className="border-b bg-white p-4">
            <div className="mx-auto container flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <UndoButton />
                    <RedoButton />
                </div>

                <div className="min-w-[50%] flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm w-full sm:w-auto justify-center">
                            <span>{error}</span>
                            <Button
                                variant="white"
                                size="sm"
                                onClick={dismissError}
                                className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                    {!isGenerating && <FileSizeBadge />}
                    {isGenerating ? (
                        <GenerationProgress />
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            <div className="w-full flex items-center gap-2">
                                <PreviewButton />
                                <PrintButton />
                            </div>
                            <DownloadButton />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
