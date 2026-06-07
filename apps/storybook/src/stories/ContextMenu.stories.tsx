import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections, emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.ContextMenu` wraps the canvas (or any element) and renders a
 * Radix-powered right-click menu. Two menus auto-discriminate on the
 * right-click target:
 *
 * - On a section: copy, duplicate, delete, layer order, hide/lock.
 * - Anywhere else: paste, select all, deselect.
 *
 * Every mutating item dispatches through `useEditor()` actions and is greyed
 * out when `Editor.Root` is `readOnly`.
 */
const meta: Meta<typeof Editor.ContextMenu> = {
    title: 'Editor/ContextMenu',
    component: Editor.ContextMenu,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.ContextMenu>;

/**
 * Right-click any section to see the section menu (copy / duplicate / delete /
 * layer order / hide / lock). Right-click empty canvas for the canvas menu
 * (paste / select all / deselect).
 */
export const OnSection: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div className="flex h-[640px] flex-col">
                <Editor.Properties />
                <Editor.Toolbar />
                <div className="flex flex-1 min-h-0">
                    <Editor.Pages />
                    <div className="flex-1 min-w-0">
                        <Editor.ContextMenu>
                            <Editor.Canvas>
                                <Editor.Section />
                            </Editor.Canvas>
                        </Editor.ContextMenu>
                    </div>
                </div>
                <Editor.Preview />
            </div>
        </Editor.Root>
    ),
};

/**
 * Empty canvas — right-click anywhere for the canvas menu (paste / select all
 * / deselect). Select-all is disabled until at least one section exists.
 */
export const OnCanvas: Story = {
    render: () => (
        <Editor.Root defaultDocument={emptyDocument()}>
            <div className="flex h-[640px] flex-col">
                <Editor.Properties />
                <Editor.Toolbar />
                <div className="flex flex-1 min-h-0">
                    <Editor.Pages />
                    <div className="flex-1 min-w-0">
                        <Editor.ContextMenu>
                            <Editor.Canvas>
                                <Editor.Section />
                            </Editor.Canvas>
                        </Editor.ContextMenu>
                    </div>
                </div>
            </div>
        </Editor.Root>
    ),
};

/**
 * Read-only — the menu still opens but every mutating item is disabled.
 * Useful for viewer surfaces where the user can still introspect but never
 * change the document.
 */
export const ReadOnly: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()} readOnly>
            <div className="flex h-[640px] flex-col">
                <Editor.Properties />
                <Editor.Toolbar />
                <div className="flex flex-1 min-h-0">
                    <Editor.Pages />
                    <div className="flex-1 min-w-0">
                        <Editor.ContextMenu>
                            <Editor.Canvas>
                                <Editor.Section />
                            </Editor.Canvas>
                        </Editor.ContextMenu>
                    </div>
                </div>
            </div>
        </Editor.Root>
    ),
};
