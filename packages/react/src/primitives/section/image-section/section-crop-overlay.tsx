'use client';

import type { ImageCrop } from '@docmosaic/core';
import { Check, X } from 'lucide-react';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';
import type { CropHandle } from './use-image-crop';

interface SectionCropOverlayProps {
    /** Section width in PDF points (raw). */
    sectionWidth: number;
    /** Section height in PDF points (raw). */
    sectionHeight: number;
    /** Active crop draft (PDF points, section-relative). */
    crop: ImageCrop;
    /**
     * Display scale (`finalScale`) — point values are multiplied by this
     * to render in display pixels so the overlay aligns with the visible
     * section box.
     */
    scale: number;
    onStartMove: (e: React.PointerEvent) => void;
    onStartResize: (e: React.PointerEvent, handle: CropHandle) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const HANDLES: ReadonlyArray<{
    handle: CropHandle;
    style: React.CSSProperties;
    cursor: string;
}> = [
    { handle: 'topLeft', style: { top: -6, left: -6 }, cursor: 'nwse-resize' },
    { handle: 'top', style: { top: -6, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { handle: 'topRight', style: { top: -6, right: -6 }, cursor: 'nesw-resize' },
    { handle: 'right', style: { top: '50%', right: -6, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { handle: 'bottomRight', style: { bottom: -6, right: -6 }, cursor: 'nwse-resize' },
    { handle: 'bottom', style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { handle: 'bottomLeft', style: { bottom: -6, left: -6 }, cursor: 'nesw-resize' },
    { handle: 'left', style: { top: '50%', left: -6, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
];

/**
 * Renders the crop window over an image section. Dims the four sides outside
 * the crop rectangle (cheap SVG mask alternative — four absolutely positioned
 * divs) and exposes 8 resize handles plus a draggable body.
 *
 * Coordinates and sizes are in PDF points; the parent's transform handles the
 * display scale, so the overlay aligns 1:1 with the underlying image.
 */
export function SectionCropOverlay({
    sectionWidth,
    sectionHeight,
    crop,
    scale,
    onStartMove,
    onStartResize,
    onConfirm,
    onCancel,
}: SectionCropOverlayProps) {
    // All overlay geometry runs in display pixels so the box aligns with the
    // visible section. The hook stores crop in PDF points; multiply once here.
    const displaySectionW = sectionWidth * scale;
    const displaySectionH = sectionHeight * scale;
    const cropX = crop.x * scale;
    const cropY = crop.y * scale;
    const cropW = crop.width * scale;
    const cropH = crop.height * scale;
    const cropRight = cropX + cropW;
    const cropBottom = cropY + cropH;

    return (
        <div className="absolute inset-0 z-30" data-crop-overlay="true">
            {/* Dimmed regions outside the crop */}
            <div
                className="absolute bg-black/50 pointer-events-none"
                style={{ left: 0, top: 0, width: displaySectionW, height: cropY }}
            />
            <div
                className="absolute bg-black/50 pointer-events-none"
                style={{
                    left: 0,
                    top: cropBottom,
                    width: displaySectionW,
                    height: Math.max(0, displaySectionH - cropBottom),
                }}
            />
            <div
                className="absolute bg-black/50 pointer-events-none"
                style={{ left: 0, top: cropY, width: cropX, height: cropH }}
            />
            <div
                className="absolute bg-black/50 pointer-events-none"
                style={{
                    left: cropRight,
                    top: cropY,
                    width: Math.max(0, displaySectionW - cropRight),
                    height: cropH,
                }}
            />

            {/* Crop rectangle */}
            <div
                onPointerDown={onStartMove}
                className={cn(
                    'absolute border-2 border-editor-accent',
                    'cursor-move pointer-events-auto',
                )}
                style={{
                    left: cropX,
                    top: cropY,
                    width: cropW,
                    height: cropH,
                }}
                data-crop-rect="true"
            >
                {/* Rule-of-thirds guides */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute top-0 bottom-0 border-l border-white/40"
                        style={{ left: '33%' }}
                    />
                    <div
                        className="absolute top-0 bottom-0 border-l border-white/40"
                        style={{ left: '66%' }}
                    />
                    <div
                        className="absolute left-0 right-0 border-t border-white/40"
                        style={{ top: '33%' }}
                    />
                    <div
                        className="absolute left-0 right-0 border-t border-white/40"
                        style={{ top: '66%' }}
                    />
                </div>

                {/* Eight handles */}
                {HANDLES.map(({ handle, style, cursor }) => (
                    <div
                        key={handle}
                        data-crop-handle={handle}
                        onPointerDown={(e) => onStartResize(e, handle)}
                        className="absolute w-3 h-3 bg-white border-2 border-editor-accent rounded-sm pointer-events-auto"
                        style={{ ...style, cursor }}
                    />
                ))}
            </div>

            {/* Confirm / cancel pill — positioned above the crop rectangle. */}
            <div
                className="absolute right-0 -top-10 flex items-center gap-1 pointer-events-auto"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <Button size="sm" variant="white" onClick={onCancel} aria-label="Cancel crop">
                    <X className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="sage" onClick={onConfirm} aria-label="Confirm crop">
                    <Check className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
