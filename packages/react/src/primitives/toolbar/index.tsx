'use client';

import { Button } from '../../ui/button';
import { DownloadButton } from './download-button';
import { EstimatedSize } from './estimated-size';
import { PreviewButton } from './preview-button';
import { PrintButton } from './print-button';
import { ProgressOverlay } from './progress-overlay';
import { RedoButton } from './redo-button';
import { UndoButton } from './undo-button';

interface ToolbarProps {
    /** Whether the undo action is available */
    canUndo: boolean;
    /** Whether the redo action is available */
    canRedo: boolean;
    /** Whether there is content to download */
    hasContent: boolean;
    /** Whether the PDF is being generated */
    isGenerating: boolean;
    /** Current generation progress (0-100) */
    progress?: number;
    /** Error message if PDF generation failed */
    error?: string;
    /** Estimated file size in bytes */
    estimatedSize: number;
    /** Callback for undo action */
    onUndo: () => void;
    /** Callback for redo action */
    onRedo: () => void;
    /** Callback for preview action */
    onPreview: () => void;
    /** Callback for print action */
    onPrint: () => void;
    /** Callback for download action */
    onDownload: () => void;
    /** Callback to cancel generation */
    onCancel: () => void;
    /** Callback to clear error */
    onErrorDismiss: () => void;
}

/**
 * Default toolbar layout for the PDF editor. Composes the standalone
 * action buttons and progress overlay. For custom arrangements, use the
 * individual `Editor.UndoButton`, `Editor.DownloadButton`, etc. directly.
 */
export function Toolbar({
    canUndo,
    canRedo,
    hasContent,
    isGenerating,
    progress,
    error,
    estimatedSize,
    onUndo,
    onRedo,
    onPreview,
    onPrint,
    onDownload,
    onCancel,
    onErrorDismiss,
}: ToolbarProps) {
    return (
        <div className="border-b bg-white p-4">
            <div className="mx-auto container flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <UndoButton canUndo={canUndo} onUndo={onUndo} />
                    <RedoButton canRedo={canRedo} onRedo={onRedo} />
                </div>

                <div className="min-w-[50%] flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm w-full sm:w-auto justify-center">
                            <span>{error}</span>
                            <Button
                                variant="white"
                                size="sm"
                                onClick={onErrorDismiss}
                                className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                    {!isGenerating && <EstimatedSize bytes={estimatedSize} />}
                    {isGenerating ? (
                        <ProgressOverlay progress={progress} onCancel={onCancel} />
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            <div className="w-full flex items-center gap-2">
                                <PreviewButton hasContent={hasContent} onPreview={onPreview} />
                                <PrintButton hasContent={hasContent} onPrint={onPrint} />
                            </div>
                            <DownloadButton hasContent={hasContent} onDownload={onDownload} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
