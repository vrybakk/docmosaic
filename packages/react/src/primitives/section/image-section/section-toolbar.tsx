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
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

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
    // Float above the image (Figma's format bar), flipping below when the box
    // sits near the top of the canvas and there's no room above — mirrors the
    // text and shape toolbars so every section variant behaves the same.
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [placeBelow, setPlaceBelow] = useState(false);
    useLayoutEffect(() => {
        const measure = () => {
            const el = toolbarRef.current;
            if (!el) return;
            const box = el.closest('[data-section="true"]');
            const scroller = el.closest('.overflow-auto');
            if (!box) return;
            const boxTop = box.getBoundingClientRect().top;
            const limit = scroller ? scroller.getBoundingClientRect().top : 0;
            setPlaceBelow(boxTop - limit < 52);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [section.x, section.y, section.width, section.height]);

    return (
        <div
            ref={toolbarRef}
            className={cn(
                // Left-aligned to the box, floating above it (or below when there's
                // no room) so it never overlaps the image content.
                'absolute left-0 z-50 flex items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-card p-1 text-card-foreground shadow-md',
                placeBelow ? 'top-full mt-2' : 'bottom-full mb-2',
                'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
                isSelected && 'opacity-100',
            )}
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
