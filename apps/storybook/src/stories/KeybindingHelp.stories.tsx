import type { Meta, StoryObj } from '@storybook/react';
import { Editor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.KeybindingHelp` — Cmd+`/` (default) opens a Radix dialog listing
 * every active keybinding, grouped by category and rendered as `<kbd>` chips.
 *
 * Must be placed inside an `Editor.Root` so it shares the context. The dialog
 * mounts its own keydown listener for the `showHelp` chord, so it doesn't need
 * a wiring step in `Editor.Root`.
 */
const meta: Meta<typeof Editor.KeybindingHelp> = {
    title: 'Editor/KeybindingHelp',
    component: Editor.KeybindingHelp,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={documentWithSections()}>
                <Editor.Properties />
                <div className="p-8 text-sm text-muted-foreground">
                    Press <kbd className="px-1 py-0.5 rounded border bg-muted">⌘</kbd> +{' '}
                    <kbd className="px-1 py-0.5 rounded border bg-muted">/</kbd> (or use the
                    controlled open prop) to view the active keymap.
                </div>
                <Story />
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Editor.KeybindingHelp>;

/** Closed by default — press the chord to open. */
export const Closed: Story = {};

/** Externally controlled open state, so the dialog is visible in the frame. */
export const Open: Story = {
    args: { open: true },
};

/** Showing the active keymap with a custom override applied. */
export const WithCustomBinding: Story = {
    args: {
        open: true,
        keymap: { redo: ['mod+r', 'mod+shift+z'] },
    },
};
