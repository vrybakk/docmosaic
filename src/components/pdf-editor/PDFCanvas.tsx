'use client';

import { ImageSectionComponent } from '@/components/pdf-editor/ImageSection';
import { ImageSection, PageDimensions, ResizeInfo } from '@/lib/types';
import { useRef, useState } from 'react';

type ResizeHandle = ResizeInfo['handle'];

interface PDFCanvasProps {
  sections: ImageSection[];
  onSectionUpdate: (section: ImageSection) => void;
  onImageUpload: (sectionId: string, imageUrl: string) => void;
  onDuplicate: (section: ImageSection) => void;
  onDelete: (sectionId: string) => void;
  backgroundPDF: string | null;
  currentPage: number;
  pageSize: PageDimensions;
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794; // 210mm
const A4_HEIGHT = 1123; // 297mm

export function PDFCanvas({
  sections,
  onSectionUpdate,
  onImageUpload,
  onDuplicate,
  onDelete,
  backgroundPDF,
  currentPage,
  pageSize,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedSection, setDraggedSection] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    handle: ResizeHandle;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [startCoords, setStartCoords] = useState<{ x: number; y: number } | null>(null);

  // Filter sections for current page
  const currentPageSections = sections.filter((section) => section.page === currentPage);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedSection(null);
    }
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    setSelectedSection(sectionId);
    // Only start dragging if we're clicking a border area
    if ((e.target as HTMLElement).classList.contains('cursor-move')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedSection) {
      const section = sections.find((s) => s.id === selectedSection);
      if (section) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        // Calculate new position within page bounds
        const newX = Math.max(0, Math.min(section.x + dx, pageSize.width - section.width));
        const newY = Math.max(0, Math.min(section.y + dy, pageSize.height - section.height));

        onSectionUpdate({
          ...section,
          x: newX,
          y: newY,
          page: currentPage, // Ensure section is associated with current page
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    } else if (resizing && startCoords && containerRef.current) {
      const section = sections.find((s) => s.id === resizing.id);
      if (!section) return;

      const deltaX = e.clientX - startCoords.x;
      const deltaY = e.clientY - startCoords.y;

      let newWidth = resizing.startWidth;
      let newHeight = resizing.startHeight;

      switch (resizing.handle) {
        case 'right':
          newWidth = Math.max(50, resizing.startWidth + deltaX);
          break;
        case 'bottom':
          newHeight = Math.max(50, resizing.startHeight + deltaY);
          break;
        case 'bottomRight':
          newWidth = Math.max(50, resizing.startWidth + deltaX);
          newHeight = Math.max(50, resizing.startHeight + deltaY);
          break;
      }

      // Ensure within bounds
      newWidth = Math.min(newWidth, A4_WIDTH - section.x);
      newHeight = Math.min(newHeight, A4_HEIGHT - section.y);

      onSectionUpdate({
        ...section,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedSection(null);
    setResizing(null);
    setStartCoords(null);
  };

  const startResizing = (e: React.MouseEvent, section: ImageSection, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      id: section.id,
      handle,
      startWidth: section.width,
      startHeight: section.height,
      startX: section.x,
      startY: section.y,
    });
    setStartCoords({ x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = (section: ImageSection) => {
    // Calculate new Y position, ensuring it stays within bounds
    const newY = Math.min(section.y + 20, A4_HEIGHT - section.height);

    // Create new section with same properties but new ID and position
    const newSection: ImageSection = {
      ...section,
      id: crypto.randomUUID(),
      y: newY,
      page: currentPage, // Ensure duplicated section is on current page
    };

    // Call the onDuplicate prop with the new section
    onDuplicate(newSection);
  };

  return (
    <div className='flex justify-center'>
      <div
        ref={canvasRef}
        className='relative bg-white shadow-lg rounded-lg overflow-hidden'
        style={{
          width: pageSize.width,
          height: pageSize.height,
          backgroundImage: backgroundPDF ? `url(${backgroundPDF})` : undefined,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentPageSections.map((section) => (
          <ImageSectionComponent
            key={section.id}
            section={section}
            isSelected={section.id === selectedSection}
            onUpdate={onSectionUpdate}
            onImageUpload={onImageUpload}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onClick={(e) => handleSectionClick(e, section.id)}
          />
        ))}
      </div>
    </div>
  );
}
