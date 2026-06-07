'use client';

import type { TextSection as TextSectionData } from '@docmosaic/core';
import { useCallback, useState } from 'react';
import { useEditorSection } from '../../../context/editor';
import { cn } from '../../../internal/utils';
import { SectionResizeHandles } from '../hooks/section-resize-handles';
import { useSectionDrag } from '../hooks/use-section-drag';
import { useSectionResize } from '../hooks/use-section-resize';
import { TextEditor } from './text-editor';
import { TextToolbar } from './text-toolbar';

/**
 * Text-variant section view. Mirrors the image variant's shell — selectable
 * box with drag, resize, and a top-right floating toolbar — but the content
 * surface is a contentEditable {@link TextEditor} instead of an image slot.
 *
 * Editing kicks in on double-click (or single-click while the section is
 * already selected). A blur exits editing mode and persists the final text
 * through `UPDATE_SECTION`.
 */
export function TextSectionView() {
    const editor = useEditorSection();
    const section = editor.section as TextSectionData;
    const {
        isSelected,
        onClick,
        onUpdate,
        onDuplicate,
        onDelete,
        groupDrag,
        readOnly,
    } = editor;
    const imageRef = { current: null } as React.RefObject<HTMLImageElement | null>;

    const [isEditing, setIsEditing] = useState(false);

    const { isResizing, handleResizeStart } = useSectionResize({
        section,
        onUpdate,
        imageRef,
    });
    const { bindDrag, isDragging } = useSectionDrag({
        section,
        onUpdate,
        isResizing: isResizing || isEditing || readOnly,
        groupDrag,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (readOnly) {
            onClick(e);
            return;
        }
        if (isSelected) {
            // Click while selected → enter editing mode.
            setIsEditing(true);
        } else {
            onClick(e);
        }
    };

    const handleTextChange = useCallback(
        (text: string) => {
            onUpdate({ ...section, text });
        },
        [onUpdate, section],
    );

    const handleEditEnd = useCallback(() => {
        setIsEditing(false);
    }, []);

    const handlePropChange = useCallback(
        (next: Partial<TextSectionData>) => {
            onUpdate({ ...section, ...next });
        },
        [onUpdate, section],
    );

    return (
        <div
            {...(isEditing || readOnly ? {} : bindDrag())}
            data-section="true"
            data-section-type="text"
            className={cn(
                'absolute p-1',
                'border-2 border-dashed border-gray-300 hover:border-editor-accent/50',
                'rounded-lg overflow-visible group touch-none pointer-events-auto',
                isSelected && 'border-solid border-editor-accent shadow-lg',
                isDragging && 'opacity-50 cursor-grabbing',
                isResizing && 'pointer-events-none',
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
            {isSelected && !isResizing && !isEditing && !readOnly && (
                <SectionResizeHandles onResizeStart={handleResizeStart} />
            )}

            {isSelected && (
                <div className="absolute inset-0 border-2 border-editor-accent border-dashed pointer-events-none z-5" />
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
                    onTextChange={handleTextChange}
                    onEditStart={() => !readOnly && setIsEditing(true)}
                    onEditEnd={handleEditEnd}
                />
                {!section.text && !isEditing && !readOnly && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                        Double-click to edit
                    </div>
                )}
            </div>

            {/* Hidden action shortcuts so the dispatcher exposes a uniform
                contextual surface — keeps duplicate/delete reachable via
                useEditorSection callers and the keyboard layer. Hidden in
                readOnly mode since nothing should mutate. */}
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
