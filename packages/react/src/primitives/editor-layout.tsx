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
 *
 * @remarks
 * `Editor.Root` arranges its children automatically; this export exists for
 * the legacy slot-prop integration path. Prefer the compound primitives
 * (`Editor.Root` + children) for new code.
 *
 * @internal Kept for back-compat with pre-namespace consumers.
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
