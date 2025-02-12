'use client';

import { Header } from '@/components/pdf-editor/Header';
import { PagePreview } from '@/components/pdf-editor/PagePreview';
import { PDFCanvas } from '@/components/pdf-editor/PDFCanvas';
import { Sidebar } from '@/components/pdf-editor/Sidebar';
import { Toolbar } from '@/components/pdf-editor/Toolbar';
import { getPageDimensionsWithOrientation } from '@/lib/page-sizes';
import { generatePDF } from '@/lib/pdf';
import { ImageSection, PageOrientation, PageSize, PDFDocument } from '@/lib/types';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Use a stable initial date for SSR
const INITIAL_DATE = '2024-01-01T00:00:00.000Z';

export default function PDFEditorPage() {
    const [document, setDocument] = useState<PDFDocument>({
        id: uuidv4(),
        name: 'Untitled Document',
        sections: [],
        createdAt: new Date(INITIAL_DATE),
        updatedAt: new Date(INITIAL_DATE),
        backgroundPDF: null,
        totalPages: 1,
        currentPage: 1,
        estimatedSize: 0,
        pageSize: 'A4',
        orientation: 'portrait',
        pages: [{ id: uuidv4(), sections: [], backgroundPDF: null }],
    });

    const [formattedDate, setFormattedDate] = useState('');
    const [history, setHistory] = useState<PDFDocument[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
    const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
    const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

    // Format date on client side only
    useEffect(() => {
        setFormattedDate(
            document.updatedAt.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        );
    }, [document.updatedAt]);

    // Set actual current date after initial mount
    useEffect(() => {
        const now = new Date();
        setDocument((prev) => ({
            ...prev,
            createdAt: now,
            updatedAt: now,
        }));
    }, []);

    const addToHistory = (newDocument: PDFDocument) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newDocument);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setDocument(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setDocument(history[historyIndex + 1]);
        }
    };

    const handleAddSection = () => {
        const newSection: ImageSection = {
            id: uuidv4(),
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            page: document.currentPage,
        };
        const newDocument = {
            ...document,
            sections: [...document.sections, newSection],
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleSectionUpdate = (updatedSection: ImageSection) => {
        const newDocument = {
            ...document,
            sections: document.sections.map((section) =>
                section.id === updatedSection.id ? updatedSection : section,
            ),
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const calculateEstimatedSize = (sections: ImageSection[]): number => {
        // Base PDF size (empty document)
        let estimatedSize = 5 * 1024; // 5KB base

        // Add size for each image section
        sections.forEach((section) => {
            if (section.imageUrl) {
                // Extract base64 data
                const base64Length = section.imageUrl.split(',')[1]?.length || 0;
                // Convert base64 to approximate byte size
                const imageSize = Math.ceil((base64Length * 3) / 4);
                estimatedSize += imageSize;
            }
        });

        return estimatedSize;
    };

    const getDownloadFileName = (name: string): string => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const sanitizedName = name.trim() || 'Untitled Document';
        return `${sanitizedName} ${timestamp}.pdf`;
    };

    const handleImageUpload = (sectionId: string, imageUrl: string) => {
        const newDocument = {
            ...document,
            sections: document.sections.map((section) =>
                section.id === sectionId ? { ...section, imageUrl } : section,
            ),
            updatedAt: new Date(),
            estimatedSize: calculateEstimatedSize([
                ...document.sections.map((s) => (s.id === sectionId ? { ...s, imageUrl } : s)),
            ]),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleDuplicateSection = (section: ImageSection) => {
        const newSection = {
            ...section,
            id: uuidv4(),
            x: section.x + 20,
            y: section.y + 20,
        };
        const newDocument = {
            ...document,
            sections: [...document.sections, newSection],
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleDownloadPDF = async () => {
        try {
            const blob = await generatePDF(document.sections, {
                pageSize: document.pageSize,
                orientation: document.orientation,
                pages: document.pages,
            });
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement('a') as HTMLAnchorElement;
            link.href = url;
            link.download = getDownloadFileName(document.name);
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Update estimated size after successful PDF generation
            const newDocument = {
                ...document,
                estimatedSize: blob.size,
                updatedAt: new Date(),
            };
            setDocument(newDocument);
            addToHistory(newDocument);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDocument = {
            ...document,
            name: e.target.value,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handlePageSizeChange = (value: string) => {
        const newDocument = {
            ...document,
            pageSize: value as PageSize,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleOrientationChange = (value: string) => {
        const newDocument = {
            ...document,
            orientation: value as PageOrientation,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handlePageChange = (pageNumber: number) => {
        const newDocument = {
            ...document,
            currentPage: pageNumber,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleAddPage = () => {
        const newDocument = {
            ...document,
            pages: [...document.pages, { id: uuidv4(), sections: [], backgroundPDF: null }],
            totalPages: document.totalPages + 1,
            currentPage: document.totalPages + 1,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleDeletePage = (pageIndex: number) => {
        if (document.pages.length <= 1) {
            alert('Cannot delete the last page');
            return;
        }

        const newPages = document.pages.filter((_, index) => index !== pageIndex);
        const newSections = document.sections.filter((section) => section.page !== pageIndex + 1);

        // Adjust page numbers for sections after the deleted page
        const adjustedSections = newSections.map((section) => {
            if (section.page > pageIndex + 1) {
                return { ...section, page: section.page - 1 };
            }
            return section;
        });

        const newDocument = {
            ...document,
            pages: newPages,
            sections: adjustedSections,
            totalPages: document.totalPages - 1,
            currentPage: Math.min(document.currentPage, document.totalPages - 1),
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleMovePage = (fromIndex: number, toIndex: number) => {
        // Early return if moving to same position
        if (fromIndex === toIndex) return;

        // Create new array of pages and move the page
        const newPages = [...document.pages];
        const [movedPage] = newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, movedPage);

        // Create a mapping of old page numbers to new page numbers
        const pageMapping = new Map<number, number>();

        if (fromIndex < toIndex) {
            // Moving forward (e.g., 1 → 3)
            // Pages in between decrease by 1
            for (let i = fromIndex + 1; i <= toIndex; i++) {
                pageMapping.set(i + 1, i);
            }
            // The moved page goes to the target position
            pageMapping.set(fromIndex + 1, toIndex + 1);
        } else {
            // Moving backward (e.g., 3 → 1)
            // Pages in between increase by 1
            for (let i = toIndex; i < fromIndex; i++) {
                pageMapping.set(i + 1, i + 2);
            }
            // The moved page goes to the target position
            pageMapping.set(fromIndex + 1, toIndex + 1);
        }

        // Adjust sections based on the mapping
        const adjustedSections = document.sections.map((section) => {
            const newPage = pageMapping.get(section.page) || section.page;
            return { ...section, page: newPage };
        });

        const newDocument = {
            ...document,
            pages: newPages,
            sections: adjustedSections,
            currentPage: toIndex + 1,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleDeleteSection = (sectionId: string) => {
        const newDocument = {
            ...document,
            sections: document.sections.filter((section) => section.id !== sectionId),
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedPageIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedPageIndex(null);
        setDragOverPageIndex(null);
        setDropPosition(null);
        if (e.target instanceof HTMLElement) {
            e.target.style.opacity = '1';
        }
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedPageIndex === null) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? 'top' : 'bottom';

        setDragOverPageIndex(index);
        setDropPosition(position);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, toIndex: number) => {
        e.preventDefault();
        if (draggedPageIndex === null || draggedPageIndex === toIndex) return;

        const finalIndex = dropPosition === 'bottom' ? toIndex + 1 : toIndex;
        handleMovePage(draggedPageIndex, finalIndex);
        setDraggedPageIndex(null);
        setDragOverPageIndex(null);
        setDropPosition(null);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                name={document.name}
                pageSize={document.pageSize}
                orientation={document.orientation}
                onNameChange={handleNameChange}
                onPageSizeChange={handlePageSizeChange}
                onOrientationChange={handleOrientationChange}
            />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    totalPages={document.totalPages}
                    currentPage={document.currentPage}
                    estimatedSize={document.estimatedSize}
                    lastModified={formattedDate}
                    onAddSection={handleAddSection}
                    onAddPage={handleAddPage}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Toolbar
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onDownload={handleDownloadPDF}
                        canUndo={historyIndex > 0}
                        canRedo={historyIndex < history.length - 1}
                        hasContent={document.sections.length > 0}
                    />

                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 p-4 overflow-auto">
                            <PDFCanvas
                                sections={document.sections}
                                onSectionUpdate={handleSectionUpdate}
                                onImageUpload={handleImageUpload}
                                onDuplicate={handleDuplicateSection}
                                onDelete={handleDeleteSection}
                                backgroundPDF={document.backgroundPDF}
                                currentPage={document.currentPage}
                                pageSize={getPageDimensionsWithOrientation(
                                    document.pageSize,
                                    document.orientation,
                                )}
                            />
                        </div>

                        <PagePreview
                            pages={document.pages}
                            sections={document.sections}
                            currentPage={document.currentPage}
                            pageSize={document.pageSize}
                            orientation={document.orientation}
                            onPageChange={handlePageChange}
                            onDeletePage={handleDeletePage}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            dragOverPageIndex={dragOverPageIndex}
                            dropPosition={dropPosition}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
