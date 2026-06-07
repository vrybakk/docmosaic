'use client';

import { ImageIcon } from 'lucide-react';
import { cn } from '../../../internal/utils';

interface SectionEmptyStateProps {
    isDroppingFile: boolean;
    onUploadClick: (e: React.MouseEvent) => void;
}

/** Empty drop-zone state shown when the section has no image yet. */
export function SectionEmptyState({ isDroppingFile, onUploadClick }: SectionEmptyStateProps) {
    return (
        <div
            className={cn(
                'w-full h-full flex items-center justify-center pointer-events-none',
                'bg-gray-50/50 hover:bg-gray-100/50 transition-colors',
                isDroppingFile && 'bg-editor-accent/5',
            )}
        >
            <button
                type="button"
                className="flex flex-col items-center gap-2 p-4 cursor-pointer pointer-events-auto rounded-lg hover:bg-gray-100/50 transition-colors border-0 bg-transparent"
                onClick={onUploadClick}
            >
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 text-center">
                    {isDroppingFile ? 'Drop Image Here' : 'Click to upload image'}
                </span>
            </button>
        </div>
    );
}
