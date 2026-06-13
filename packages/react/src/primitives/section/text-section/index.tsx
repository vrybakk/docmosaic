'use client';

import type { TextSection as TextSectionData } from '@docmosaic/core';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditor, useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { useSectionDrag } from '../hooks/use-section-drag';
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
    const { isSelected, onClick, onUpdate, onDuplicate, onDelete, groupDrag, finalScale, readOnly } =
        editor;
    const { actions } = useEditor();

    const [isEditing, setIsEditing] = useState(false);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const didAutoEdit = useRef(false);

    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        isResizing: isEditing || readOnly,
        groupDrag,
    });

    /** Measure the natural (unscaled, points-space) size of `text`. */
    const measureRaw = useCallback(
        (text: string): { width: number; height: number } | null => {
            const node = mirrorRef.current;
            if (!node) return null;
            node.textContent = text === '' ? EMPTY_PLACEHOLDER : text;
            const lineHeight = rawSection.lineHeight ?? 1.15;
            const lineCount = text === '' ? 1 : text.split('\n').length;
            return {
                width: node.offsetWidth,
                height: Math.round(lineCount * rawSection.fontSize * lineHeight),
            };
        },
        [rawSection.lineHeight, rawSection.fontSize],
    );

    // Keep the box hugging its content: re-measure on text/typography changes
    // (and once on mount, sizing freshly-created or loaded sections). The guard
    // makes this idempotent so it never loops.
    useLayoutEffect(() => {
        // Read-only/static documents are immutable — trust the persisted
        // (already content-derived) geometry rather than re-measuring.
        if (readOnly) return;
        const m = measureRaw(rawSection.text);
        if (m && (m.width !== rawSection.width || m.height !== rawSection.height)) {
            actions.updateSection({ ...rawSection, width: m.width, height: m.height });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        rawSection.text,
        rawSection.fontSize,
        rawSection.fontFamily,
        rawSection.fontWeight,
        rawSection.fontStyle,
        rawSection.lineHeight,
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
            actions.updateSection(
                m ? { ...rawSection, text, width: m.width, height: m.height } : { ...rawSection, text },
            );
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
                className="pointer-events-none invisible absolute left-[-9999px] top-0 whitespace-pre"
                style={{
                    fontFamily: rawSection.fontFamily ?? 'helvetica',
                    fontSize: rawSection.fontSize,
                    fontWeight: rawSection.fontWeight === 'bold' ? 700 : 400,
                    fontStyle: rawSection.fontStyle === 'italic' ? 'italic' : 'normal',
                    lineHeight: rawSection.lineHeight ?? 1.15,
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
