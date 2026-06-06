'use client';

import { estimatePDFSize, type PageOrientation, type PageSize } from '@docmosaic/core';
import { EditorConfigProvider, defaultImageRenderer } from '../context/editor-config';
import { useDocumentState } from '../hooks/use-document-state';
import { trackEvent } from '../internal/analytics';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Canvas } from './canvas/index';
import { EditorLayout } from './editor-layout';
import { Header } from './header/index';
import { Preview } from './preview/index';
import { Sidebar } from './sidebar/index';
import { Toolbar } from './toolbar/index';
import { usePdfGeneration } from './use-pdf-generation';

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
    const [estimatedSize, setEstimatedSize] = useState<number>(0);

    const {
        state: generationState,
        download,
        print,
        abort,
        dismissError,
    } = usePdfGeneration({ document, onSizeKnown: updateEstimatedSize });

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
            updateSection({ ...section, imageUrl });
        }
    };

    const handleAddSection = () => {
        trackEvent.addSection();
        const section = addSection();
        setSelectedSectionId(section.id);
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
        <EditorConfigProvider value={{ imageRenderer: defaultImageRenderer }}>
            <DndProvider backend={HTML5Backend}>
                <EditorLayout
                    header={
                        <Header
                            name={document.name}
                            pageSize={document.pageSize}
                            orientation={document.orientation}
                            onNameChange={handleNameChange}
                            onPageSizeChange={handlePageSizeChange}
                            onOrientationChange={handleOrientationChange}
                        />
                    }
                    toolbar={
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
                            onPrint={print}
                            onDownload={download}
                            isGenerating={generationState.isGenerating}
                            progress={generationState.progress}
                            error={generationState.error}
                            estimatedSize={estimatedSize}
                            onCancel={abort}
                            onErrorDismiss={dismissError}
                        />
                    }
                    sidebar={
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
                    }
                    canvas={
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
                    }
                    preview={
                        <Preview
                            isOpen={isPreviewOpen}
                            onClose={() => setIsPreviewOpen(false)}
                            onDownload={download}
                            pages={document.pages}
                            sections={document.sections}
                            pageSize={document.pageSize}
                            orientation={document.orientation}
                        />
                    }
                />
            </DndProvider>
        </EditorConfigProvider>
    );
}
