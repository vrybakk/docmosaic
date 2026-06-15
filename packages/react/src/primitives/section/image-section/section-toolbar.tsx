'use client';

import type { ImageSection, Section } from '@docmosaic/core';
import {
    ChevronDown,
    ChevronUp,
    ChevronsDown,
    ChevronsUp,
    Copy,
    Maximize2,
    Trash2,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import { floatingToolbarClass, useFloatingToolbar } from '../hooks/use-floating-toolbar';

interface SectionToolbarProps {
    section: ImageSection;
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
    const { toolbarRef, placeBelow, offsetX } = useFloatingToolbar([
        section.x,
        section.y,
        section.width,
        section.height,
    ]);

    return (
        <div
            ref={toolbarRef}
            style={offsetX ? { transform: `translateX(${offsetX}px)` } : undefined}
            className={floatingToolbarClass(placeBelow, isSelected)}
        >
            {section.imageUrl && (
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-accent pointer-events-auto"
                    onClick={onResizeToProportion}
                    title="Fit to image proportion"
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            )}
            <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-accent pointer-events-auto"
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
                className="h-8 w-8 hover:bg-accent pointer-events-auto"
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
                className="h-8 w-8 hover:bg-accent pointer-events-auto"
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
                className="h-8 w-8 hover:bg-accent pointer-events-auto"
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
                className="h-8 w-8 hover:bg-accent pointer-events-auto"
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
