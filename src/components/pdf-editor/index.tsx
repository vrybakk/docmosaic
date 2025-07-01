'use client';

import { trackEvent } from '@/lib/analytics';
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

    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [generationState, setGenerationState] = useState<GenerationState>({
        isGenerating: false,
    });
    const [estimatedSize, setEstimatedSize] = useState<number>(0);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        trackEvent.editorInit();
    }, []);

    useEffect(() => {
        const backgrounds = document.pages.map((page) => page.backgroundPDF);
        const size = estimatePDFSize(document.sections, backgrounds);
        setEstimatedSize(size);
    }, [document.sections, document.pages]);

    const handleImageUpload = (sectionId: string, imageUrl: string) => {
        const section = document.sections.find((s) => s.id === sectionId);
        if (section) {
            updateSection({ ...section, imageUrl, type: section.type || 'image' });
        }
    };

    const handleAddSection = () => {
        trackEvent.addSection();
        const section = addSection('image');
        setSelectedSectionId(section.id);
        setIsMobileSidebarOpen(false);
    };

    const handleAddTextSection = () => {
        trackEvent.addSection();
        const section = addSection('text');
        setSelectedSectionId(section.id);
        setIsMobileSidebarOpen(false);
    };

    const handleCancel = () => {
        abortControllerRef.current?.abort();
        setGenerationState({
            isGenerating: false,
            error: 'PDF generation cancelled.',
        });
    };

    const handleDownload = async () => {
        try {
            abortControllerRef.current = new AbortController();

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
                    signal: abortControllerRef.current.signal,
                },
                (progress) => {
                    setGenerationState((prev) => ({
                        ...prev,
                        ...progress,
                    }));
                },
            );

            const url = URL.createObjectURL(blob);

            const link = globalThis.document.createElement('a');
            link.href = url;
            link.download = getDownloadFileName(document.name);
            globalThis.document.body.appendChild(link);
            link.click();

            globalThis.document.body.removeChild(link);
            URL.revokeObjectURL(url);

            updateEstimatedSize(blob.size);

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
                <Header
                    name={document.name}
                    pageSize={document.pageSize}
                    orientation={document.orientation}
                    onNameChange={handleNameChange}
                    onPageSizeChange={handlePageSizeChange}
                    onOrientationChange={handleOrientationChange}
                />

                <Toolbar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    hasContent={document.sections.length > 0}
                    onUndo={() => {
                        trackEvent.undo();
                        undo();
                    }}
                    onRedo={() => {
                        trackEvent.redo();
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

                <div className="flex-1 flex min-h-0">
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
                                    onAddTextSection={handleAddTextSection}
                                    onAddPage={addPage}
                                    onPageChange={changePage}
                                    onDeletePage={deletePage}
                                    onReorderPages={reorderPages}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="hidden lg:block">
                        <Sidebar
                            pages={document.pages}
                            sections={document.sections}
                            currentPage={document.currentPage}
                            pageSize={document.pageSize}
                            orientation={document.orientation}
                            lastModified={formattedDate}
                            onAddSection={handleAddSection}
                            onAddTextSection={handleAddTextSection}
                            onAddPage={addPage}
                            onPageChange={changePage}
                            onDeletePage={deletePage}
                            onReorderPages={reorderPages}
                        />
                    </div>

                    <Canvas
                        page={document.pages[document.currentPage - 1]}
                        pageSize={document.pageSize}
                        orientation={document.orientation}
                        sections={document.sections}
                        selectedSectionId={selectedSectionId}
                        currentPage={document.currentPage}
                        onSectionSelect={setSelectedSectionId}
                        onSectionUpdate={updateSection}
                        onSectionDuplicate={duplicateSection}
                        onSectionDelete={deleteSection}
                        onImageUpload={handleImageUpload}
                        onSectionCreate={(section) => {
                            const newSection = addSection('image');
                            updateSection({
                                ...section,
                                id: newSection.id,
                                type: 'image',
                            });
                            setSelectedSectionId(newSection.id);
                        }}
                    />
                </div>

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
