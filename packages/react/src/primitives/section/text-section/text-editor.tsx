'use client';

import type { TextSection } from '@docmosaic/core';
import { useEffect, useRef } from 'react';
import { cn } from '../../../internal/utils';

interface TextEditorProps {
    section: TextSection;
    isEditing: boolean;
    onTextChange: (text: string) => void;
    onEditStart: () => void;
    onEditEnd: () => void;
}

/**
 * Editable text surface for a {@link TextSection}. Renders a contentEditable
 * `<div>` styled to match the section's typography props and fires
 * {@link TextEditorProps.onTextChange} on every input event.
 *
 * @remarks
 * The contentEditable surface only accepts input while `isEditing` is true.
 * Click-to-focus is handled in the orchestrator — this component stays a
 * dumb view so the dispatcher can drive selection + editing state.
 */
export function TextEditor({
    section,
    isEditing,
    onTextChange,
    onEditStart,
    onEditEnd,
}: TextEditorProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Sync external text changes (e.g. undo/redo) into the DOM. Skip when the
    // node is currently focused so we don't blow away the caret while typing.
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (document.activeElement === node) return;
        if (node.innerText !== section.text) {
            node.innerText = section.text;
        }
    }, [section.text]);

    const handleInput = () => {
        const node = ref.current;
        if (!node) return;
        onTextChange(node.innerText);
    };

    return (
        <div
            ref={ref}
            data-text-editor="true"
            contentEditable={isEditing}
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={onEditEnd}
            onDoubleClick={onEditStart}
            className={cn(
                'w-full h-full outline-none whitespace-pre-wrap break-words',
                isEditing ? 'cursor-text' : 'cursor-pointer pointer-events-auto',
            )}
            style={{
                fontFamily: section.fontFamily ?? 'helvetica',
                fontSize: section.fontSize,
                fontWeight: section.fontWeight === 'bold' ? 700 : 400,
                fontStyle: section.fontStyle === 'italic' ? 'italic' : 'normal',
                color: section.color ?? 'rgb(0,0,0)',
                textAlign: section.align ?? 'left',
                lineHeight: section.lineHeight ?? 1.15,
            }}
        >
            {section.text}
        </div>
    );
}
