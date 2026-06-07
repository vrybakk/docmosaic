'use client';

import type { ImageCrop, ImageSection, Section } from '@docmosaic/core';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Eight handle directions for the crop window. Matches the section-resize
 * vocabulary so the visual story stays consistent.
 */
export type CropHandle =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';

interface UseImageCropArgs {
    section: ImageSection;
    onUpdate: (next: Section) => void;
    /**
     * Display scale: `finalScale` from {@link useEditorSection}. Pointer deltas
     * arrive in display pixels; the hook divides by `scale` before applying
     * them to the crop region (which lives in PDF points).
     */
    scale: number;
}

interface UseImageCropResult {
    /** `true` while crop mode is active. Toggled by `enterCropMode`. */
    isCropping: boolean;
    /** Working crop draft — populated while in crop mode. */
    draft: ImageCrop | null;
    /** Enter crop mode. Seeds the draft from `section.crop` or the full box. */
    enterCropMode: () => void;
    /** Commit the draft to the section. No-op if no draft is active. */
    confirmCrop: () => void;
    /** Discard the draft and leave crop mode. */
    cancelCrop: () => void;
    /** Clear the section's existing crop (`section.crop = undefined`). */
    clearCrop: () => void;
    /** Begin dragging the entire crop window. */
    startMove: (e: React.PointerEvent) => void;
    /** Begin resizing the crop window via a handle. */
    startResize: (e: React.PointerEvent, handle: CropHandle) => void;
}

const MIN_CROP_SIZE_PT = 10;

/**
 * Crop-interaction hook for {@link ImageSection}. Owns the in-flight crop
 * draft and the pointer handlers for moving / resizing the crop window. The
 * caller renders the visual overlay (see `section-crop-overlay.tsx`); this
 * hook is purely state + math so it can be unit-tested without a DOM.
 *
 * Crop coordinates live in PDF points relative to the section's bounding box
 * (`[0, 0, section.width, section.height]`). Pointer deltas come in display
 * pixels and are divided by `scale` before applying.
 */
export function useImageCrop({ section, onUpdate, scale }: UseImageCropArgs): UseImageCropResult {
    const [isCropping, setIsCropping] = useState(false);
    const [draft, setDraft] = useState<ImageCrop | null>(null);
    const draftRef = useRef<ImageCrop | null>(null);
    draftRef.current = draft;

    const enterCropMode = useCallback(() => {
        const initial: ImageCrop = section.crop ?? {
            x: 0,
            y: 0,
            width: section.width,
            height: section.height,
        };
        setDraft(initial);
        setIsCropping(true);
    }, [section]);

    const cancelCrop = useCallback(() => {
        setDraft(null);
        setIsCropping(false);
    }, []);

    const confirmCrop = useCallback(() => {
        const current = draftRef.current;
        if (!current) {
            setIsCropping(false);
            return;
        }
        // If the draft covers the full section box, treat that as "no crop"
        // — the renderer takes the byte-stable legacy path when `crop` is
        // undefined, so we keep documents identical whenever possible.
        const isFullBox =
            current.x === 0 &&
            current.y === 0 &&
            current.width === section.width &&
            current.height === section.height;
        const nextSection: ImageSection = isFullBox
            ? { ...section, crop: undefined }
            : { ...section, crop: current };
        onUpdate(nextSection as Section);
        setDraft(null);
        setIsCropping(false);
    }, [section, onUpdate]);

    const clearCrop = useCallback(() => {
        const next: ImageSection = { ...section, crop: undefined };
        onUpdate(next as Section);
        setDraft(null);
        setIsCropping(false);
    }, [section, onUpdate]);

    // Pointer drag plumbing — kept inside the hook so the overlay component
    // doesn't have to track listeners itself. We snapshot the draft at gesture
    // start so successive moves apply against the original, not the running
    // value.
    const gestureRef = useRef<{
        mode: 'move' | 'resize';
        handle?: CropHandle;
        startPointerX: number;
        startPointerY: number;
        startCrop: ImageCrop;
    } | null>(null);

    const stopGesture = useCallback(() => {
        gestureRef.current = null;
    }, []);

    useEffect(() => {
        if (!isCropping) return;

        const onPointerMove = (event: PointerEvent) => {
            const gesture = gestureRef.current;
            if (!gesture) return;
            const dx = (event.clientX - gesture.startPointerX) / scale;
            const dy = (event.clientY - gesture.startPointerY) / scale;
            setDraft((prev) => {
                if (!prev) return prev;
                if (gesture.mode === 'move') {
                    return clampMove(gesture.startCrop, dx, dy, section);
                }
                return clampResize(gesture.startCrop, gesture.handle!, dx, dy, section);
            });
        };

        const onPointerUp = () => {
            stopGesture();
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    }, [isCropping, scale, section, stopGesture]);

    const startMove = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            const current = draftRef.current;
            if (!current) return;
            gestureRef.current = {
                mode: 'move',
                startPointerX: e.clientX,
                startPointerY: e.clientY,
                startCrop: current,
            };
        },
        [],
    );

    const startResize = useCallback(
        (e: React.PointerEvent, handle: CropHandle) => {
            e.stopPropagation();
            const current = draftRef.current;
            if (!current) return;
            gestureRef.current = {
                mode: 'resize',
                handle,
                startPointerX: e.clientX,
                startPointerY: e.clientY,
                startCrop: current,
            };
        },
        [],
    );

    return {
        isCropping,
        draft,
        enterCropMode,
        confirmCrop,
        cancelCrop,
        clearCrop,
        startMove,
        startResize,
    };
}

function clampMove(
    start: ImageCrop,
    dx: number,
    dy: number,
    bounds: { width: number; height: number },
): ImageCrop {
    const nextX = Math.max(0, Math.min(bounds.width - start.width, start.x + dx));
    const nextY = Math.max(0, Math.min(bounds.height - start.height, start.y + dy));
    return { ...start, x: nextX, y: nextY };
}

function clampResize(
    start: ImageCrop,
    handle: CropHandle,
    dx: number,
    dy: number,
    bounds: { width: number; height: number },
): ImageCrop {
    let { x, y, width, height } = start;
    if (handle === 'left' || handle === 'topLeft' || handle === 'bottomLeft') {
        const newX = Math.max(0, Math.min(start.x + start.width - MIN_CROP_SIZE_PT, start.x + dx));
        width = start.width + (start.x - newX);
        x = newX;
    }
    if (handle === 'right' || handle === 'topRight' || handle === 'bottomRight') {
        width = Math.max(MIN_CROP_SIZE_PT, Math.min(bounds.width - start.x, start.width + dx));
    }
    if (handle === 'top' || handle === 'topLeft' || handle === 'topRight') {
        const newY = Math.max(0, Math.min(start.y + start.height - MIN_CROP_SIZE_PT, start.y + dy));
        height = start.height + (start.y - newY);
        y = newY;
    }
    if (handle === 'bottom' || handle === 'bottomLeft' || handle === 'bottomRight') {
        height = Math.max(
            MIN_CROP_SIZE_PT,
            Math.min(bounds.height - start.y, start.height + dy),
        );
    }
    return { x, y, width, height };
}
