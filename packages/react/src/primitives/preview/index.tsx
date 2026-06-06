'use client';

import { Download, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEditor } from '../../context/editor';
import { trackEvent } from '../../internal/analytics';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';

/**
 * Preview dialog. Reads its open state, the document, and the download
 * action from the editor context. Generates a preview blob whenever the
 * dialog opens and re-renders if the document changes underneath it.
 *
 * Uses `pdfBackend.generate` from context so a custom backend supplied via
 * `Editor.Root` `pdf` prop is honored here too.
 */
export function Preview() {
    const { state, ui, pdfApi, pdfBackend } = useEditor();
    const { pages, sections, pageSize, orientation } = state;
    const { isPreviewOpen, closePreview } = ui;

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (!isPreviewOpen) return;
        trackEvent.preview();

        const generatePreviews = async () => {
            setIsLoading(true);
            try {
                const blob = await pdfBackend.generate(sections, {
                    pageSize,
                    orientation,
                    pages,
                    preview: true,
                });
                const url = URL.createObjectURL(blob);
                setPreviewUrls([url]);
            } catch (error) {
                console.error('Error generating preview:', error);
            } finally {
                setIsLoading(false);
            }
        };

        generatePreviews();

        return () => {
            previewUrls.forEach(URL.revokeObjectURL);
            setPreviewUrls([]);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPreviewOpen, sections, pageSize, orientation, pages]);

    const handlePrint = async () => {
        if (!previewUrls[0]) return;
        trackEvent.print(true);
        const response = await fetch(previewUrls[0]);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
                URL.revokeObjectURL(url);
            };
        }
    };

    const handleDownload = () => {
        trackEvent.download(true);
        void pdfApi.download();
    };

    const PreviewContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Preview</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="cream"
                        onClick={handlePrint}
                        className="print-button-click-trigger"
                        disabled={isLoading || !previewUrls.length}
                        icon={<Printer className="h-4 w-4" />}
                    >
                        Print
                    </Button>
                    <Button
                        variant="sage"
                        onClick={handleDownload}
                        className="download-button-click-trigger"
                        icon={<Download className="h-4 w-4" />}
                    >
                        Download
                    </Button>
                    <Button variant="white" size="icon" onClick={closePreview}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-editor-accent" />
                    </div>
                ) : (
                    <div className="h-full overflow-auto p-4">
                        <div className="flex flex-col items-center gap-4 w-full touch-pan-y touch-pinch-zoom">
                            {previewUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className="bg-white shadow-lg w-full relative"
                                    style={{ height: 'calc(90vh - 150px)' }}
                                >
                                    <embed
                                        src={url}
                                        type="application/pdf"
                                        className="w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {pages.length > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t">
                    <Button
                        variant="white"
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {currentPage + 1} of {pages.length}
                    </span>
                    <Button
                        variant="white"
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
                        }
                        disabled={currentPage === pages.length - 1}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && closePreview()}>
            <DialogHeader className="hidden">
                <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <DialogContent
                className="max-w-[95vw] w-[900px] h-[90vh] p-0"
                hideCloseButton
                aria-describedby="preview-dialog-description"
            >
                <div id="preview-dialog-description" className="sr-only">
                    Preview your PDF document with options to print or download
                </div>
                <PreviewContent />
            </DialogContent>
        </Dialog>
    );
}
