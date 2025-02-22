'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { generatePDF } from '@/lib/pdf';
import { ImageSection, Page, PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { Download, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PreviewProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    pages: Page[];
    sections: ImageSection[];
    pageSize: PageSize;
    orientation: PageOrientation;
}

/**
 * Preview component for PDF editor
 * Shows live preview of the PDF with print and download options
 */
export function Preview({
    isOpen,
    onClose,
    onDownload,
    pages,
    sections,
    pageSize,
    orientation,
}: PreviewProps) {
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Generate preview when dialog opens
    useEffect(() => {
        if (!isOpen) return;

        const generatePreviews = async () => {
            setIsLoading(true);
            try {
                const blob = await generatePDF(sections, {
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
    }, [isOpen, sections, pageSize, orientation, pages]);

    // Preview content with controls
    const PreviewContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Preview</h2>
                <div className="flex items-center gap-2">
                    {!isMobile && (
                        <>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    if (!previewUrls[0]) return;
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
                                }}
                                className="bg-white hover:bg-gray-50"
                                disabled={isLoading || !previewUrls.length}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Button
                                variant="default"
                                onClick={onDownload}
                                className="bg-docmosaic-purple hover:bg-docmosaic-purple/90 text-white"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </>
                    )}
                    {!isMobile && (
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-docmosaic-purple" />
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
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {currentPage + 1} of {pages.length}
                    </span>
                    <Button
                        variant="outline"
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

    // Render mobile sheet or desktop dialog
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" className="h-[90vh]">
                    <PreviewContent />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogHeader className="hidden">
                <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <DialogContent className="max-w-[95vw] w-[900px] h-[90vh] p-0" hideCloseButton>
                <PreviewContent />
            </DialogContent>
        </Dialog>
    );
}
