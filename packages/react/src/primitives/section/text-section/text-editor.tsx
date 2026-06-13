'use client';

import type { TextSection } from '@docmosaic/core';
import { useEffect, useRef } from 'react';
import { cn } from '../../../internal/utils';

interface TextEditorProps {
    section: TextSection;
    isEditing: boolean;
    /** Canvas display scale (pageScale * zoom). The stored font size is in
     *  points; multiply by this so the rendered text tracks the scaled box. */
    scale: number;
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
 * Auto-width: `white-space: pre` so the text never word-wraps — it grows
 * rightward as you type and breaks only on explicit newlines. The
 * contentEditable surface only accepts input while `isEditing` is true.
 */
export function TextEditor({
    section,
    isEditing,
    scale,
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

    // When editing begins (e.g. auto-on-create or click-to-edit), focus the
    // node and drop the caret at the end. Set innerText *before* focusing so
    // the sync effect's `activeElement` guard then protects the caret.
    useEffect(() => {
        const node = ref.current;
        if (!node || !isEditing) return;
        if (document.activeElement === node) return;
        if (node.innerText !== section.text) {
            node.innerText = section.text;
        }
        node.focus();
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNodeContents(node);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

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
                'w-full h-full outline-none',
                // fixedWidth wraps to the box; auto-width grows rightward.
                section.fixedWidth ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
                isEditing ? 'cursor-text' : 'cursor-pointer pointer-events-auto',
            )}
            style={{
                fontFamily: section.fontFamily ?? 'helvetica',
                fontSize: section.fontSize * scale,
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
