'use client';

import { PDFCanvas } from '@/components/pdf-editor/PDFCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { getPageDimensions, PAGE_SIZE_LABELS } from '@/lib/page-sizes';
import { generatePDF } from '@/lib/pdf';
import { ImageSection, PageOrientation, PageSize, PDFDocument } from '@/lib/types';
import { Download, Plus, Redo, Undo } from 'lucide-react';
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
      })
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
      sections: document.sections.map((section) => (section.id === updatedSection.id ? updatedSection : section)),
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
      sections: document.sections.map((section) => (section.id === sectionId ? { ...section, imageUrl } : section)),
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
      const link = window.document.createElement('a');
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

  // Calculate actual page dimensions based on size and orientation
  const getPageDimensionsWithOrientation = (size: PageSize, orientation: PageOrientation) => {
    const dimensions = getPageDimensions(size, 'px'); // Get dimensions in pixels for rendering
    if (orientation === 'landscape') {
      return {
        width: dimensions.height,
        height: dimensions.width,
        unit: dimensions.unit,
      };
    }
    return dimensions;
  };

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <header className='bg-docmosaic-purple p-4 flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Input
            type='text'
            value={document.name}
            onChange={handleNameChange}
            className='bg-transparent border-none text-docmosaic-cream placeholder-docmosaic-cream/50 text-lg font-semibold focus:ring-0'
            placeholder='Untitled Document'
          />
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <SelectField
              value={document.pageSize}
              onValueChange={handlePageSizeChange}
              options={Object.entries(PAGE_SIZE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
              className='w-64 text-docmosaic-cream border-docmosaic-cream'
            />
            <SelectField
              value={document.orientation}
              onValueChange={handleOrientationChange}
              options={[
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
              className='w-32 text-docmosaic-cream border-docmosaic-cream'
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left sidebar */}
        <div className='w-64 bg-gray-50 border-r p-4'>
          <div className='space-y-4'>
            <div className='flex flex-col space-y-2'>
              <Button onClick={handleAddSection} className='w-full'>
                <Plus className='w-4 h-4 mr-2' />
                Add Image
              </Button>
              <Button onClick={handleAddPage} className='w-full'>
                <Plus className='w-4 h-4 mr-2' />
                Add Page
              </Button>
            </div>
            <div className='text-sm space-y-2'>
              <p>Pages: {document.totalPages}</p>
              <p>Current Page: {document.currentPage}</p>
              <p>
                Estimated Size:{' '}
                {document.estimatedSize < 1024 * 1024
                  ? `${(document.estimatedSize / 1024).toFixed(2)} KB`
                  : `${(document.estimatedSize / (1024 * 1024)).toFixed(2)} MB`}
              </p>
              <p>Last Modified: {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Main canvas area */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Toolbar */}
          <div className='p-4 border-b flex justify-between items-center bg-white'>
            <div className='flex items-center space-x-2'>
              <Button variant='ghost' size='icon' onClick={handleUndo} disabled={historyIndex <= 0}>
                <Undo className='w-5 h-5' />
              </Button>
              <Button variant='ghost' size='icon' onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <Redo className='w-5 h-5' />
              </Button>
            </div>
            <Button
              variant='default'
              className='bg-docmosaic-terracotta hover:bg-docmosaic-terracotta/90'
              onClick={handleDownloadPDF}
              disabled={document.sections.length === 0}
            >
              <Download className='w-5 h-5 mr-2' />
              Download PDF
            </Button>
          </div>

          {/* Canvas and preview */}
          <div className='flex-1 flex overflow-hidden'>
            {/* Canvas */}
            <div className='flex-1 p-4 overflow-auto'>
              <PDFCanvas
                sections={document.sections}
                onSectionUpdate={handleSectionUpdate}
                onImageUpload={handleImageUpload}
                onDuplicate={handleDuplicateSection}
                onDelete={handleDeleteSection}
                backgroundPDF={document.backgroundPDF}
                currentPage={document.currentPage}
                pageSize={getPageDimensionsWithOrientation(document.pageSize, document.orientation)}
              />
            </div>

            {/* Preview */}
            <div className='w-64 border-l bg-gray-50 p-4 overflow-auto'>
              <h3 className='font-semibold mb-4'>Page Preview</h3>
              <div className='space-y-4'>
                {document.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className='relative group'
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div
                      className={`w-full bg-white rounded-lg shadow cursor-pointer transition-all relative overflow-hidden
                        ${
                          index + 1 === document.currentPage
                            ? 'ring-2 ring-docmosaic-terracotta'
                            : 'hover:ring-2 hover:ring-docmosaic-orange'
                        }
                        ${
                          dragOverPageIndex === index && dropPosition === 'top'
                            ? 'border-t-4 border-docmosaic-terracotta'
                            : ''
                        }
                        ${
                          dragOverPageIndex === index && dropPosition === 'bottom'
                            ? 'border-b-4 border-docmosaic-terracotta'
                            : ''
                        }`}
                      style={{
                        aspectRatio: `${
                          getPageDimensionsWithOrientation(document.pageSize, document.orientation).width
                        } / ${getPageDimensionsWithOrientation(document.pageSize, document.orientation).height}`,
                      }}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {/* Page preview content */}
                      <div className='absolute inset-0'>
                        {/* Scale the preview to match the actual page dimensions */}
                        <div
                          className='absolute inset-0'
                          style={{
                            transform: `scale(${Math.min(
                              220 / getPageDimensionsWithOrientation(document.pageSize, document.orientation).width,
                              310 / getPageDimensionsWithOrientation(document.pageSize, document.orientation).height
                            )})`,
                            transformOrigin: 'top left',
                            width: getPageDimensionsWithOrientation(document.pageSize, document.orientation).width,
                            height: getPageDimensionsWithOrientation(document.pageSize, document.orientation).height,
                          }}
                        >
                          {document.sections
                            .filter((section) => section.page === index + 1)
                            .map((section) => (
                              <div
                                key={section.id}
                                className='absolute'
                                style={{
                                  left: section.x,
                                  top: section.y,
                                  width: section.width,
                                  height: section.height,
                                }}
                              >
                                {section.imageUrl && (
                                  <img src={section.imageUrl} alt='' className='w-full h-full object-contain' />
                                )}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Page number */}
                      <div className='absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10'>
                        Page {index + 1}
                      </div>
                    </div>

                    {/* Page actions - only delete button */}
                    <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20'>
                      <button
                        onClick={() => handleDeletePage(index)}
                        className='w-6 h-6 bg-white rounded shadow hover:bg-red-100 text-red-600'
                        title='Delete page'
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add a final drop zone for moving to the end */}
                {draggedPageIndex !== null && (
                  <div
                    className={`h-24 border-4 border-dashed rounded-lg transition-all ${
                      dragOverPageIndex === document.pages.length
                        ? 'border-docmosaic-terracotta bg-docmosaic-terracotta/10'
                        : 'border-gray-300'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverPageIndex(document.pages.length);
                      setDropPosition('bottom');
                    }}
                    onDrop={(e) => handleDrop(e, document.pages.length)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
