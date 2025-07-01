'use client';

import { Button } from '@/components/ui/core/button';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { Download, Eye, Loader2, Printer, Redo, Undo, X } from 'lucide-react';

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
 * Toolbar component for the PDF editor
 * Contains undo/redo controls and download button
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
    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handlePreview = () => {
        trackEvent.preview();
        onPreview();
    };

    const handlePrint = () => {
        trackEvent.print(false); // false indicates print from toolbar
        onPrint();
    };

    const handleDownload = () => {
        trackEvent.download(false); // false indicates download from toolbar
        onDownload();
    };

    return (
        <div className="border-b bg-white p-4">
            <div className="mx-auto container flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={cn(
                            'hover:bg-docmosaic-sage/10',
                            'text-docmosaic-purple',
                            'disabled:opacity-50',
                            'h-10 w-10',
                        )}
                    >
                        <Undo className="h-5 w-5" />
                        <span className="sr-only">Undo</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={cn(
                            'hover:bg-docmosaic-sage/10',
                            'text-docmosaic-purple',
                            'disabled:opacity-50',
                            'h-10 w-10',
                        )}
                    >
                        <Redo className="h-5 w-5" />
                        <span className="sr-only">Redo</span>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm w-full sm:w-auto justify-center">
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onErrorDismiss}
                                className="text-red-600 hover:text-red-700 h-6 px-2"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                    {estimatedSize && !isGenerating && (
                        <div className="text-sm text-gray-500 hidden sm:block">
                            Estimated size: {formatFileSize(estimatedSize)}
                        </div>
                    )}
                    {isGenerating ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                            <div className="flex items-center gap-2 min-w-[160px] bg-docmosaic-purple text-docmosaic-cream px-4 py-2 rounded-md relative">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>
                                    {progress ? `Generating (${progress}%)` : 'Generating...'}
                                </span>
                                {progress && (
                                    <div
                                        className="absolute bottom-0 left-0 h-1 bg-docmosaic-cream/20"
                                        style={{ width: `${progress}%` }}
                                    />
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCancel}
                                className="text-red-600 hover:text-red-700 border-red-200"
                            >
                                <X className="h-4 w-4" />
                                <span className="ml-2">Cancel</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <div className="w-full flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={!hasContent}
                                    className={cn(
                                        'bg-white hover:bg-gray-50',
                                        'disabled:opacity-50',
                                        'w-full',
                                    )}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handlePrint}
                                    disabled={!hasContent}
                                    className={cn(
                                        'bg-white hover:bg-gray-50',
                                        'disabled:opacity-50',
                                        'w-full',
                                    )}
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                            </div>
                            <Button
                                variant="default"
                                onClick={handleDownload}
                                disabled={!hasContent}
                                className={cn(
                                    'bg-docmosaic-purple hover:bg-docmosaic-purple/90',
                                    'text-docmosaic-cream min-w-[160px]',
                                    'disabled:opacity-50',
                                    'w-full sm:w-auto',
                                )}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
