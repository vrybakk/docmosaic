'use client';

import type { Section } from '@docmosaic/core';
import {
    ChevronDown,
    ChevronUp,
    ChevronsDown,
    ChevronsUp,
    Copy,
    Maximize2,
    Trash2,
} from 'lucide-react';
import { cn } from '../../internal/utils';
import { Button } from '../../ui/button';

interface SectionToolbarProps {
    section: Section;
    isSelected: boolean;
    onResizeToProportion: () => void;
    onDuplicate: (section: Section) => void;
    onDelete: (sectionId: string) => void;
    onBringToFront: (sectionId: string) => void;
    onSendToBack: (sectionId: string) => void;
    onMoveForward: (sectionId: string) => void;
    onMoveBackward: (sectionId: string) => void;
}

/** Action buttons row (fit / layer / duplicate / delete) shown on hover or selection. */
export function SectionToolbar({
    section,
    isSelected,
    onResizeToProportion,
    onDuplicate,
    onDelete,
    onBringToFront,
    onSendToBack,
    onMoveForward,
    onMoveBackward,
}: SectionToolbarProps) {
    return (
        <div
            className={cn(
                'absolute top-2 right-2 flex gap-1 bg-white rounded-lg shadow-md p-1 z-50 pointer-events-none',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
            )}
        >
            {section.imageUrl && (
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                    onClick={onResizeToProportion}
                    title="Fit to image proportion"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            )}
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onBringToFront(section.id);
                }}
                title="Bring to front"
            >
                <ChevronsUp className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onMoveForward(section.id);
                }}
                title="Move forward"
            >
                <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onMoveBackward(section.id);
                }}
                title="Move backward"
            >
                <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onSendToBack(section.id);
                }}
                title="Send to back"
            >
                <ChevronsDown className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-100 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(section);
                }}
                title="Duplicate"
            >
                <Copy className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-red-50 text-red-600 pointer-events-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(section.id);
                }}
                title="Delete"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
