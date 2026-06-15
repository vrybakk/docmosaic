import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.Root readOnly` renders the editor as a viewer — every mutating
 * interaction (drag, resize, drop, file upload, page add/delete/reorder,
 * undo/redo, keyboard nudge/delete, drawing-mode strokes) is suppressed and
 * the mutating toolbar buttons hide themselves.
 *
 * Selection, marquee selection, zoom, preview, print, and PDF/PNG download
 * stay live so the viewer can still inspect and export.
 *
 * `Editor.StaticCanvas` is a convenience alias for the canvas-level
 * read-only override — useful when you want a single viewer canvas inside
 * an otherwise editable root (e.g. a compare view).
 */
const meta: Meta<typeof Editor.Root> = {
    title: 'Editor/ReadOnly',
    component: Editor.Root,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Editor.Root>;

/** Root-level `readOnly` — Add/Undo/Redo/Draw buttons hide; Preview/Print/Download remain. */
export const RootReadOnly: Story = {
    args: {
        readOnly: true,
        defaultDocument: documentWithSections(),
        children: (
            <>
                <Editor.Properties />
                <Editor.Toolbar />
                <Editor.Pages />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
};

/**
 * `Editor.StaticCanvas` standalone — the root is fully editable, but the
 * canvas itself refuses to mutate so sections aren't draggable from this
 * surface. Useful when you want a viewer pane alongside other editable
 * regions.
 */
export const StaticCanvasStandalone: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <Editor.Properties />
            <Editor.Toolbar />
            <div className="flex-1 flex min-h-0">
                <Editor.Pages />
                <Editor.StaticCanvas>
                    <Editor.Section />
                </Editor.StaticCanvas>
            </div>
            <Editor.Preview />
        </Editor.Root>
    ),
};

/**
 * Combined — `Editor.Root readOnly` with `Editor.StaticCanvas`. Mostly
 * redundant (the root is already read-only), but demonstrates that the
 * two flags fold via OR.
 */
export const RootReadOnlyWithStaticCanvas: Story = {
    args: {
        readOnly: true,
        defaultDocument: documentWithSections(),
        children: (
            <>
                <Editor.Properties />
                <Editor.Toolbar />
                <Editor.Pages />
                <Editor.StaticCanvas />
                <Editor.Preview />
            </>
        ),
    },
};
