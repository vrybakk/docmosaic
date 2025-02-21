import { useEffect, useState } from 'react';
import { ImageSection, PageOrientation, PageSize, PDFDocument } from '../types';
import { createInitialDocument, createNewImageSection, createNewPage } from '../utils/document';

export function useDocumentState() {
    const [document, setDocument] = useState<PDFDocument>(createInitialDocument());
    const [formattedDate, setFormattedDate] = useState('');
    const [history, setHistory] = useState<PDFDocument[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

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

    const updateDocument = (updates: Partial<PDFDocument>) => {
        const newDocument = {
            ...document,
            ...updates,
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const addSection = () => {
        const newSection = createNewImageSection(5, 5, document.currentPage);
        const newDocument = {
            ...document,
            sections: [...document.sections, newSection],
            updatedAt: new Date(),
        };
        setDocument(newDocument);
        addToHistory(newDocument);
        return newSection;
    };

    const updateSection = (updatedSection: ImageSection) => {
        updateDocument({
            sections: document.sections.map((section) =>
                section.id === updatedSection.id ? updatedSection : section,
            ),
        });
    };

    const deleteSection = (sectionId: string) => {
        updateDocument({
            sections: document.sections.filter((section) => section.id !== sectionId),
        });
    };

    const duplicateSection = (section: ImageSection) => {
        const newSection = {
            ...section,
            id: crypto.randomUUID(),
            x: section.x + 20,
            y: section.y + 20,
        };
        updateDocument({
            sections: [...document.sections, newSection],
        });
    };

    const addPage = () => {
        updateDocument({
            pages: [...document.pages, createNewPage()],
            totalPages: document.totalPages + 1,
            currentPage: document.totalPages + 1,
        });
    };

    const deletePage = (pageIndex: number) => {
        if (document.pages.length <= 1) {
            alert('Cannot delete the last page');
            return;
        }

        const newPages = document.pages.filter((_, index) => index !== pageIndex);
        const newSections = document.sections.filter((section) => section.page !== pageIndex + 1);
        const adjustedSections = newSections.map((section) => {
            if (section.page > pageIndex + 1) {
                return { ...section, page: section.page - 1 };
            }
            return section;
        });

        updateDocument({
            pages: newPages,
            sections: adjustedSections,
            totalPages: document.totalPages - 1,
            currentPage: Math.min(document.currentPage, document.totalPages - 1),
        });
    };

    const changePage = (pageNumber: number) => {
        updateDocument({
            currentPage: pageNumber,
        });
    };

    const updatePageSize = (value: PageSize) => {
        updateDocument({
            pageSize: value,
        });
    };

    const updateOrientation = (value: PageOrientation) => {
        updateDocument({
            orientation: value,
        });
    };

    const updateName = (name: string) => {
        updateDocument({
            name,
        });
    };

    const reorderPages = (fromIndex: number, toIndex: number) => {
        // Get the page being moved
        const pageToMove = document.pages[fromIndex];

        // Create new pages array with reordered pages
        const newPages = [...document.pages];
        newPages.splice(fromIndex, 1);
        newPages.splice(toIndex, 0, pageToMove);

        // Update sections to reflect new page order
        const updatedSections = document.sections.map((section) => {
            if (section.page === fromIndex + 1) {
                return { ...section, page: toIndex + 1 };
            } else if (
                fromIndex < toIndex &&
                section.page > fromIndex + 1 &&
                section.page <= toIndex + 1
            ) {
                return { ...section, page: section.page - 1 };
            } else if (
                fromIndex > toIndex &&
                section.page >= toIndex + 1 &&
                section.page < fromIndex + 1
            ) {
                return { ...section, page: section.page + 1 };
            }
            return section;
        });

        // Update document with new page order
        const newDocument = {
            ...document,
            pages: newPages,
            sections: updatedSections,
            currentPage: document.currentPage,
            updatedAt: new Date(),
        };

        setDocument(newDocument);
        addToHistory(newDocument);
    };

    const updateEstimatedSize = (size: number) => {
        updateDocument({
            estimatedSize: size,
            updatedAt: new Date(),
        });
    };

    return {
        document,
        formattedDate,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        actions: {
            undo: handleUndo,
            redo: handleRedo,
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
    };
}
