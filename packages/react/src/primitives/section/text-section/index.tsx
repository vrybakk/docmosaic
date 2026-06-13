'use client';

import type { TextSection as TextSectionData } from '@docmosaic/core';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditor, useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import type { ResizeHandle } from '../hooks/use-section-resize';
import { TextEditor } from './text-editor';
import { TextToolbar } from './text-toolbar';

/** Placeholder shown (and measured) for an empty text box. */
const EMPTY_PLACEHOLDER = 'Text';

/**
 * Text-variant section view. Unlike the image/shape variants, text is
 * **auto-width** (Figma-style): the box hugs its content rather than being a
 * fixed, resizable rectangle. Geometry (`width`/`height`, in PDF points) is
 * derived from the rendered text via a hidden, unscaled measurement mirror and
 * written straight back through `actions.updateSection` — so it round-trips at
 * any zoom without the `finalScale` division the scaled `onUpdate` applies.
 *
 * Editing begins immediately on creation (caret focused), or on click while
 * already selected / double-click. There are no resize handles: content owns
 * the size; only position (drag) is user-controlled.
 */
export function TextSectionView() {
    const editor = useEditorSection();
    const section = editor.section as TextSectionData;
    const rawSection = editor.rawSection as TextSectionData;
    const {
        isSelected,
        onClick,
        onUpdate,
        onDuplicate,
        onDelete,
        groupDrag,
        onDragEnd,
        finalScale,
        readOnly,
    } = editor;
    const { actions } = useEditor();

    const [isEditing, setIsEditing] = useState(false);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const didAutoEdit = useRef(false);

    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        isResizing: isEditing || readOnly,
        groupDrag,
        onDragEnd,
    });

    /**
     * Measure the (unscaled, points-space) size of `text`. Auto-width: the
     * natural no-wrap size. Fixed-width: keep the user-set `width` and measure
     * the wrapped height from the mirror (which wraps at that width).
     */
    const measureRaw = useCallback(
        (text: string): { width: number; height: number } | null => {
            const node = mirrorRef.current;
            if (!node) return null;
            node.textContent = text === '' ? EMPTY_PLACEHOLDER : text;
            const lineHeight = rawSection.lineHeight ?? 1.15;
            if (rawSection.fixedWidth) {
                const oneLine = Math.round(rawSection.fontSize * lineHeight);
                return { width: rawSection.width, height: Math.max(oneLine, node.offsetHeight) };
            }
            const lineCount = text === '' ? 1 : text.split('\n').length;
            return {
                width: node.offsetWidth,
                height: Math.round(lineCount * rawSection.fontSize * lineHeight),
            };
        },
        [rawSection.lineHeight, rawSection.fontSize, rawSection.fixedWidth, rawSection.width],
    );

    // Keep the box hugging its content: re-measure on text/typography changes
    // (and once on mount, sizing freshly-created or loaded sections). The guard
    // makes this idempotent so it never loops.
    useLayoutEffect(() => {
        // Read-only/static documents are immutable — trust the persisted
        // (already content-derived) geometry rather than re-measuring.
        if (readOnly) return;
        const m = measureRaw(rawSection.text);
        if (!m) return;
        // fixedHeight keeps the user-dragged height, but never below the
        // content so text can't clip (and still grows past it).
        const height = rawSection.fixedHeight ? Math.max(m.height, rawSection.height) : m.height;
        if (m.width !== rawSection.width || height !== rawSection.height) {
            actions.updateSection({ ...rawSection, width: m.width, height });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        rawSection.text,
        rawSection.fontSize,
        rawSection.fontFamily,
        rawSection.fontWeight,
        rawSection.fontStyle,
        rawSection.lineHeight,
        rawSection.fixedWidth,
        rawSection.fixedHeight,
        rawSection.width,
        rawSection.height,
    ]);

    // Type immediately on creation: a freshly-added empty box enters edit mode
    // once. Re-selecting an existing empty box later won't (ref-guarded).
    useEffect(() => {
        if (didAutoEdit.current) return;
        didAutoEdit.current = true;
        if (isSelected && section.text === '' && !readOnly) {
            setIsEditing(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (readOnly) {
            onClick(e);
            return;
        }
        if (isSelected) {
            setIsEditing(true);
        } else {
            onClick(e);
        }
    };

    // Persist text + freshly-measured geometry in a single update so each
    // keystroke is one history step and the box never lags the text.
    const handleTextChange = useCallback(
        (text: string) => {
            const m = measureRaw(text);
            if (!m) {
                actions.updateSection({ ...rawSection, text });
                return;
            }
            const height = rawSection.fixedHeight ? Math.max(m.height, rawSection.height) : m.height;
            actions.updateSection({ ...rawSection, text, width: m.width, height });
        },
        [actions, rawSection, measureRaw],
    );

    const handleEditEnd = useCallback(() => {
        setIsEditing(false);
    }, []);

    const handlePropChange = useCallback(
        (next: Partial<TextSectionData>) => {
            actions.updateSection({ ...rawSection, ...next });
        },
        [actions, rawSection],
    );

    // Box resize: handles change the box, never the font (adjust that via the
    // toolbar). Left/right (and corners) set the WIDTH and wrap the text;
    // top/bottom (and corners) set the HEIGHT so the box can be taller than its
    // text. Left/top handles also shift the origin so the box grows from that
    // edge. Height never drops below the content (the measure effect clamps).
    const resizeStart = useRef<{
        handle: ResizeHandle;
        clientX: number;
        clientY: number;
        width: number;
        height: number;
        x: number;
        y: number;
    } | null>(null);

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, handle: ResizeHandle) => {
            e.preventDefault();
            e.stopPropagation();
            resizeStart.current = {
                handle,
                clientX: e.clientX,
                clientY: e.clientY,
                width: rawSection.width,
                height: rawSection.height,
                x: rawSection.x,
                y: rawSection.y,
            };
            const onMove = (ev: MouseEvent) => {
                const start = resizeStart.current;
                if (!start) return;
                const h = start.handle;
                const hasWidth = h !== 'top' && h !== 'bottom';
                const hasHeight = h !== 'left' && h !== 'right';
                const next = { ...rawSection };
                if (hasWidth) {
                    const dx = (ev.clientX - start.clientX) / finalScale;
                    const towardLeft = h === 'left' || h.includes('Left');
                    const width = Math.max(40, Math.round(start.width + (towardLeft ? -dx : dx)));
                    next.fixedWidth = true;
                    next.width = width;
                    if (towardLeft) next.x = Math.round(start.x + (start.width - width));
                }
                if (hasHeight) {
                    const dy = (ev.clientY - start.clientY) / finalScale;
                    const towardTop = h === 'top' || h.includes('Top');
                    const height = Math.max(20, Math.round(start.height + (towardTop ? -dy : dy)));
                    next.fixedHeight = true;
                    next.height = height;
                    if (towardTop) next.y = Math.round(start.y + (start.height - height));
                }
                actions.updateSection(next);
            };
            const onUp = () => {
                resizeStart.current = null;
                window.removeEventListener('mousemove', onMove, true);
                window.removeEventListener('mouseup', onUp, true);
            };
            window.addEventListener('mousemove', onMove, true);
            window.addEventListener('mouseup', onUp, true);
        },
        [actions, rawSection, finalScale],
    );

    return (
        <div
            {...(isEditing || readOnly ? {} : bindDrag())}
            data-section="true"
            data-section-id={section.id}
            data-section-type="text"
            className={cn(
                'absolute group touch-none pointer-events-auto overflow-visible',
                isDragging && 'opacity-50 cursor-grabbing',
            )}
            style={{
                left: section.x,
                top: section.y,
                width: section.width,
                height: section.height,
                zIndex: (section.zIndex ?? 0) + (isSelected ? 1000 : 0),
                cursor: readOnly
                    ? 'default'
                    : isEditing
                      ? 'text'
                      : isDragging
                        ? 'grabbing'
                        : 'grab',
            }}
            onClick={handleClick}
        >
            {/* Selection / hover affordance — sits just outside the tight box so
                it never affects content size or the text origin. */}
            {!readOnly && (
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute -inset-1 rounded-md border-2 border-dashed border-muted-foreground/40',
                        'opacity-0 transition-opacity group-hover:opacity-100',
                        isSelected && 'border-solid border-primary opacity-100',
                    )}
                />
            )}

            {isSelected && !isEditing && !readOnly && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {!readOnly && (
                <TextToolbar
                    section={section}
                    isSelected={isSelected}
                    onUpdate={handlePropChange}
                />
            )}

            <div className="relative w-full h-full">
                <TextEditor
                    section={section}
                    isEditing={isEditing && !readOnly}
                    scale={finalScale}
                    onTextChange={handleTextChange}
                    onEditStart={() => !readOnly && setIsEditing(true)}
                    onEditEnd={handleEditEnd}
                />
                {!section.text && !isEditing && !readOnly && (
                    <div
                        className="pointer-events-none absolute left-0 top-0 select-none whitespace-pre text-muted-foreground/50"
                        style={{
                            fontFamily: section.fontFamily ?? 'helvetica',
                            fontSize: section.fontSize * finalScale,
                            lineHeight: section.lineHeight ?? 1.15,
                        }}
                    >
                        {EMPTY_PLACEHOLDER}
                    </div>
                )}
            </div>

            {/* Hidden, unscaled mirror used to measure natural text size in
                points-space (font props at raw values, no scale applied). */}
            <div
                ref={mirrorRef}
                aria-hidden="true"
                className="pointer-events-none invisible absolute left-[-9999px] top-0"
                style={{
                    fontFamily: rawSection.fontFamily ?? 'helvetica',
                    fontSize: rawSection.fontSize,
                    fontWeight: rawSection.fontWeight === 'bold' ? 700 : 400,
                    fontStyle: rawSection.fontStyle === 'italic' ? 'italic' : 'normal',
                    lineHeight: rawSection.lineHeight ?? 1.15,
                    // Match the editor: wrap at the fixed width to measure height,
                    // else grow naturally (no wrap) to measure width.
                    whiteSpace: rawSection.fixedWidth ? 'pre-wrap' : 'pre',
                    width: rawSection.fixedWidth ? rawSection.width : 'auto',
                    wordBreak: rawSection.fixedWidth ? 'break-word' : 'normal',
                }}
            />

            {/* Hidden action shortcuts so duplicate/delete stay reachable via
                useEditorSection callers and the keyboard layer. */}
            {!readOnly && (
                <>
                    <button
                        type="button"
                        aria-label="duplicate"
                        tabIndex={-1}
                        className="sr-only"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(section);
                        }}
                    />
                    <button
                        type="button"
                        aria-label="delete"
                        tabIndex={-1}
                        className="sr-only"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(section.id);
                        }}
                    />
                </>
            )}
        </div>
    );
}
