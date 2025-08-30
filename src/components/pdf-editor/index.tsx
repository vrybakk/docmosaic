'use client';

import { trackEvent } from '@/lib/analytics';
import { isMobile } from '@/lib/mobile/detection';
import { hapticFeedback } from '@/lib/mobile/haptics';
import { estimatePDFSize, generatePDF } from '@/lib/pdf';
import { useDocumentState } from '@/lib/pdf-editor/hooks/useDocumentState';
import { getDownloadFileName } from '@/lib/pdf-editor/utils/document';
import { PageOrientation, PageSize } from '@/lib/types';
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../ui/core/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/navigation/sheet';
import { Canvas } from './canvas/index';
import { Header } from './header/index';
import { Preview } from './preview/index';
import { Sidebar } from './sidebar/index';
import { Toolbar } from './toolbar/index';

interface GenerationState {
    isGenerating: boolean;
    progress?: number;
    stage?: 'optimizing' | 'generating' | 'complete';
    error?: string;
}

/**
 * PDF Editor component
 * Main layout component that integrates all editor components
 */
export function PDFEditor() {
    const {
        document,
        formattedDate,
        canUndo,
        canRedo,
        actions: {
            undo,
            redo,
            addSection,
            updateSection,
            deleteSection,
            duplicateSection,
            addPage,
            deletePage,
            changePage,
            updatePageSize,
            updateOrientation,
            updateName,
            reorderPages,
            updateEstimatedSize,
        },
    } = useDocumentState();

    // Track selected section
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    // Track preview dialog state
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    // Track PDF generation state
    const [generationState, setGenerationState] = useState<GenerationState>({
        isGenerating: false,
    });
    // Track estimated file size
    const [estimatedSize, setEstimatedSize] = useState<number>(0);
    // Track mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // AbortController for cancellation
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        trackEvent.editorInit();
    }, []);

    // Update estimated size when document changes
    useEffect(() => {
        const backgrounds = document.pages.map((page) => page.backgroundPDF);
        const size = estimatePDFSize(document.sections, backgrounds);
        setEstimatedSize(size);
    }, [document.sections, document.pages]);

    // Handle image upload
    const handleImageUpload = (sectionId: string, imageUrl: string) => {
        const section = document.sections.find((s) => s.id === sectionId);
        if (section) {
            updateSection({ ...section, imageUrl });
        }
    };

    // Handle adding a new section
    const handleAddSection = () => {
        trackEvent.addSection();

        // Haptic feedback on mobile for adding section
        if (typeof window !== 'undefined' && isMobile()) {
            hapticFeedback.success();
        }

        // Add section in the center of the viewport
        const section = addSection();
        // Select the new section
        setSelectedSectionId(section.id);
        // Close mobile sidebar if open
        setIsMobileSidebarOpen(false);
    };

    // Handle PDF generation cancellation
    const handleCancel = () => {
        abortControllerRef.current?.abort();
        setGenerationState({
            isGenerating: false,
            error: 'PDF generation cancelled.',
        });
    };

    // Handle PDF download
    const handleDownload = async () => {
        try {
            // Create new AbortController
            abortControllerRef.current = new AbortController();

            setGenerationState({
                isGenerating: true,
                stage: 'optimizing',
                progress: 0,
            });

            // Generate the PDF
            const blob = await generatePDF(
                document.sections,
                {
                    pageSize: document.pageSize,
                    orientation: document.orientation,
                    pages: document.pages,
                    signal: abortControllerRef.current.signal,
                },
                (progress) => {
                    setGenerationState((prev) => ({
                        ...prev,
                        ...progress,
                    }));
                },
            );

            // Create download URL
            const url = URL.createObjectURL(blob);

            // Create and trigger download link
            const link = globalThis.document.createElement('a');
            link.href = url;
            link.download = getDownloadFileName(document.name);
            globalThis.document.body.appendChild(link);
            link.click();

            // Cleanup
            globalThis.document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Update document with new estimated size
            updateEstimatedSize(blob.size);

            // Reset generation state
            setGenerationState({
                isGenerating: false,
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            setGenerationState({
                isGenerating: false,
                error:
                    (error as Error).message === 'PDF generation cancelled'
                        ? 'PDF generation cancelled.'
                        : 'Failed to generate PDF. Please try again.',
            });
        } finally {
            abortControllerRef.current = null;
        }
    };

    // Handle print
    const handlePrint = async () => {
        try {
            setGenerationState({
                isGenerating: true,
                stage: 'optimizing',
                progress: 0,
            });

            const blob = await generatePDF(
                document.sections,
                {
                    pageSize: document.pageSize,
                    orientation: document.orientation,
                    pages: document.pages,
                },
                (progress) => {
                    setGenerationState((prev) => ({
                        ...prev,
                        ...progress,
                    }));
                },
            );

            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                    URL.revokeObjectURL(url);
                };
            }

            setGenerationState({
                isGenerating: false,
            });
        } catch (error) {
            console.error('Error printing PDF:', error);
            setGenerationState({
                isGenerating: false,
                error: 'Failed to print PDF. Please try again.',
            });
        }
    };

    // Handle error dismissal
    const handleErrorDismiss = () => {
        setGenerationState((prev) => ({
            ...prev,
            error: undefined,
        }));
    };

    const handlePageSizeChange = (value: PageSize) => {
        trackEvent.pageSize(value);
        updatePageSize(value);
    };

    const handleOrientationChange = (value: PageOrientation) => {
        trackEvent.orientation(value);
        updateOrientation(value);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        trackEvent.rename(document.name, newName);
        updateName(newName);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen bg-gray-50">
                {/* Header */}
                <Header
                    name={document.name}
                    pageSize={document.pageSize}
                    orientation={document.orientation}
                    onNameChange={handleNameChange}
                    onPageSizeChange={handlePageSizeChange}
                    onOrientationChange={handleOrientationChange}
                />

                {/* Toolbar */}
                <Toolbar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    hasContent={document.sections.length > 0}
                    onUndo={() => {
                        trackEvent.undo();

                        // Haptic feedback on mobile for undo
                        if (typeof window !== 'undefined' && isMobile()) {
                            hapticFeedback.undoRedo();
                        }

                        undo();
                    }}
                    onRedo={() => {
                        trackEvent.redo();

                        // Haptic feedback on mobile for redo
                        if (typeof window !== 'undefined' && isMobile()) {
                            hapticFeedback.undoRedo();
                        }

                        redo();
                    }}
                    onPreview={() => setIsPreviewOpen(true)}
                    onPrint={handlePrint}
                    onDownload={handleDownload}
                    isGenerating={generationState.isGenerating}
                    progress={generationState.progress}
                    error={generationState.error}
                    estimatedSize={estimatedSize}
                    onCancel={handleCancel}
                    onErrorDismiss={handleErrorDismiss}
                />

                {/* Main content area */}
                <div className="flex-1 flex min-h-0">
                    {/* Mobile quick actions */}
                    <div className="lg:hidden fixed bottom-4 left-4 z-50 flex flex-col gap-2">
                        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-lg bg-docmosaic-purple text-white"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] p-0">
                                <Sidebar
                                    pages={document.pages}
                                    sections={document.sections}
                                    currentPage={document.currentPage}
                                    pageSize={document.pageSize}
                                    orientation={document.orientation}
                                    lastModified={formattedDate}
                                    onAddSection={handleAddSection}
                                    onAddPage={addPage}
                                    onPageChange={changePage}
                                    onDeletePage={deletePage}
                                    onReorderPages={reorderPages}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop sidebar */}
                    <div className="hidden lg:block">
                        <Sidebar
                            pages={document.pages}
                            sections={document.sections}
                            currentPage={document.currentPage}
                            pageSize={document.pageSize}
                            orientation={document.orientation}
                            lastModified={formattedDate}
                            onAddSection={handleAddSection}
                            onAddPage={addPage}
                            onPageChange={changePage}
                            onDeletePage={deletePage}
                            onReorderPages={reorderPages}
                        />
                    </div>

                    {/* Canvas */}
                    <Canvas
                        page={document.pages[document.currentPage - 1]}
                        pageSize={document.pageSize}
                        orientation={document.orientation}
                        sections={document.sections}
                        selectedSectionId={selectedSectionId}
                        currentPage={document.currentPage}
                        totalPages={document.pages.length}
                        onSectionSelect={setSelectedSectionId}
                        onSectionUpdate={updateSection}
                        onSectionDuplicate={duplicateSection}
                        onSectionDelete={deleteSection}
                        onImageUpload={handleImageUpload}
                        onSectionCreate={(section) => {
                            const newSection = addSection();
                            updateSection({
                                ...section,
                                id: newSection.id,
                            });
                            setSelectedSectionId(newSection.id);
                        }}
                    />
                </div>

                {/* Preview Dialog */}
                <Preview
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    onDownload={handleDownload}
                    pages={document.pages}
                    sections={document.sections}
                    pageSize={document.pageSize}
                    orientation={document.orientation}
                />
            </div>
        </DndProvider>
    );
}
