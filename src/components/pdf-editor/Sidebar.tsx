'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SidebarProps {
    totalPages: number;
    currentPage: number;
    estimatedSize: number;
    lastModified: string;
    onAddSection: () => void;
    onAddPage: () => void;
}

export function Sidebar({
    totalPages,
    currentPage,
    estimatedSize,
    lastModified,
    onAddSection,
    onAddPage,
}: SidebarProps) {
    return (
        <div className="w-64 bg-gray-50 border-r p-4">
            <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                    <Button onClick={onAddSection} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Image
                    </Button>
                    <Button onClick={onAddPage} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Page
                    </Button>
                </div>
                <div className="text-sm space-y-2">
                    <p>Pages: {totalPages}</p>
                    <p>Current Page: {currentPage}</p>
                    <p>
                        Estimated Size:{' '}
                        {estimatedSize < 1024 * 1024
                            ? `${(estimatedSize / 1024).toFixed(2)} KB`
                            : `${(estimatedSize / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                    <p>Last Modified: {lastModified}</p>
                </div>
            </div>
        </div>
    );
}
