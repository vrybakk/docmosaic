'use client';

import { ImageSection } from '@/lib/types';
import { useRef } from 'react';

interface ImageSectionProps {
  section: ImageSection;
  isSelected: boolean;
  onUpdate: (section: ImageSection) => void;
  onImageUpload: (sectionId: string, imageUrl: string) => void;
  onDuplicate: (section: ImageSection) => void;
  onDelete: (sectionId: string) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function ImageSectionComponent({
  section,
  isSelected,
  onUpdate,
  onImageUpload,
  onDuplicate,
  onDelete,
  onClick,
}: ImageSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(section.id, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(section.id, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResize = (e: React.MouseEvent, handle: 'right' | 'bottom' | 'bottomRight') => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = section.width;
    const startHeight = section.height;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handle === 'right' || handle === 'bottomRight') {
        newWidth = Math.max(100, startWidth + dx);
      }
      if (handle === 'bottom' || handle === 'bottomRight') {
        newHeight = Math.max(100, startHeight + dy);
      }

      onUpdate({
        ...section,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleBorderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <div
      className={`absolute ${isSelected ? 'z-50' : 'z-10'}`}
      style={{
        left: section.x,
        top: section.y,
        width: section.width,
        height: section.height,
      }}
    >
      <div className='relative w-full h-full group'>
        {/* Upload zone */}
        <div
          className='absolute inset-0 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center z-10 w-[90%] h-[90%] m-auto'
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {section.imageUrl ? (
            <div className='relative w-full h-full group'>
              <img src={section.imageUrl} alt='Uploaded content' className='w-full h-full object-contain' />
              {/* Overlay for re-upload */}
              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                <button
                  className='px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg font-medium text-sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Replace Image
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center text-gray-400'>
              <svg className='w-8 h-8 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <span className='text-sm'>Click or drop image here</span>
            </div>
          )}
          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleImageUpload} />
        </div>

        {/* Draggable border and resize handles */}
        <div
          className={`absolute inset-0 ${
            isSelected ? 'border-2 border-blue-500' : 'border-2 border-transparent group-hover:border-blue-500'
          }`}
        >
          {/* Draggable border areas */}
          <div
            className='absolute inset-x-0 top-0 h-2 cursor-move hover:bg-blue-500/10'
            onMouseDown={handleBorderMouseDown}
          />
          <div
            className='absolute inset-x-0 bottom-0 h-2 cursor-move hover:bg-blue-500/10'
            onMouseDown={handleBorderMouseDown}
          />
          <div
            className='absolute inset-y-0 left-0 w-2 cursor-move hover:bg-blue-500/10'
            onMouseDown={handleBorderMouseDown}
          />
          <div
            className='absolute inset-y-0 right-0 w-2 cursor-move hover:bg-blue-500/10'
            onMouseDown={handleBorderMouseDown}
          />

          {/* Resize handles */}
          <div
            className='absolute w-2 h-8 bg-white border-2 border-blue-500 right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize opacity-0 group-hover:opacity-100 pointer-events-auto z-50'
            onMouseDown={(e) => handleResize(e, 'right')}
          />
          <div
            className='absolute h-2 w-8 bg-white border-2 border-blue-500 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize opacity-0 group-hover:opacity-100 pointer-events-auto z-50'
            onMouseDown={(e) => handleResize(e, 'bottom')}
          />
          <div
            className='absolute w-4 h-4 bg-white border-2 border-blue-500 bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize opacity-0 group-hover:opacity-100 pointer-events-auto z-50'
            onMouseDown={(e) => handleResize(e, 'bottomRight')}
          />
        </div>

        {/* Duplicate and Delete buttons */}
        <div className='absolute -top-2 left-0 w-full justify-between flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50'>
          {/* Duplicate button */}
          <button
            className='relative -left-2.5 w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-50'
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(section);
            }}
            title='Duplicate section'
          >
            <svg className='w-4 h-4 text-blue-500' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
          </button>
          {/* Delete button */}
          <button
            className='relative -right-2.5 w-6 h-6 bg-white border-2 border-red-500 rounded-full flex items-center justify-center hover:bg-red-50'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}
            title='Delete section'
          >
            <svg className='w-4 h-4 text-red-500' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
