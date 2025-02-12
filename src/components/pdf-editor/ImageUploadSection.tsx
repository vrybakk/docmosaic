'use client';

import { ImageSection } from '@/lib/types';
import { useState } from 'react';

interface ImageUploadSectionProps {
  section: ImageSection;
  onImageUpload: (imageUrl: string) => void;
}

export default function ImageUploadSection({ section, onImageUpload }: ImageUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageUpload(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  return (
    <div
      className={`absolute inset-0 upload-zone ${isDragging ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => e.stopPropagation()}
    >
      {section.imageUrl ? (
        <div className='w-full h-full group'>
          <img src={section.imageUrl} alt='Uploaded' className='w-full h-full object-contain' />
          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center'>
            <label className='px-4 py-2 bg-white text-black rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all'>
              Replace Image
              <input type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
            </label>
          </div>
        </div>
      ) : (
        <label
          className={`w-full h-full flex flex-col items-center justify-center border-2 ${
            isDragging ? 'border-blue-500' : 'border-dashed border-gray-300'
          } rounded-lg cursor-pointer hover:border-gray-400 transition-colors`}
        >
          <div className='flex flex-col items-center p-4'>
            <svg className='w-10 h-10 text-gray-400 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            <span className='text-sm text-gray-500 text-center'>
              {isDragging ? 'Drop image here' : 'Click or drag image here'}
            </span>
            <span className='text-xs text-gray-400 mt-1'>Supports: JPEG, PNG, GIF</span>
          </div>
          <input type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
        </label>
      )}
    </div>
  );
}
