'use client';

import { Button } from '@/components/ui/button';
import { Download, Redo, Undo } from 'lucide-react';

interface ToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onDownload: () => void;
    canUndo: boolean;
    canRedo: boolean;
    hasContent: boolean;
}

export function Toolbar({
    onUndo,
    onRedo,
    onDownload,
    canUndo,
    canRedo,
    hasContent,
}: ToolbarProps) {
    return (
        <div className="p-4 border-b flex justify-between items-center bg-white">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}>
                    <Undo className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo}>
                    <Redo className="w-5 h-5" />
                </Button>
            </div>
            <Button
                variant="default"
                className="bg-docmosaic-terracotta hover:bg-docmosaic-terracotta/90"
                onClick={onDownload}
                disabled={!hasContent}
            >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
            </Button>
        </div>
    );
}
