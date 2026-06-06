import type { ReactNode } from 'react';

interface EditorLayoutProps {
    header: ReactNode;
    toolbar: ReactNode;
    sidebar: ReactNode;
    canvas: ReactNode;
    preview: ReactNode;
}

/**
 * Pure layout shell for the PDF editor. Composes the five panels into the
 * editor's flex column. No state, no analytics, no callbacks — just slots.
 */
export function EditorLayout({ header, toolbar, sidebar, canvas, preview }: EditorLayoutProps) {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {header}
            {toolbar}
            <div className="flex-1 flex min-h-0">
                {sidebar}
                {canvas}
            </div>
            {preview}
        </div>
    );
}
