import type { Meta, StoryObj } from '@storybook/react';
import { Editor, toast } from '@docmosaic/react';

/**
 * `Editor.Toaster` mounts a `react-hot-toast` toaster styled with the
 * editor's semantic theme tokens. Drop one inside `Editor.Root` (or at the
 * app root) and fire toasts with the re-exported `toast` helper.
 */
const meta: Meta<typeof Editor.Toaster> = {
    title: 'Editor/Toaster',
    component: Editor.Toaster,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Toaster>;

function ButtonRow() {
    return (
        <div className="flex flex-col gap-2 items-start">
            <button
                type="button"
                className="px-3 py-2 rounded border border-border bg-card text-card-foreground"
                onClick={() => toast('Plain toast')}
            >
                Fire plain toast
            </button>
            <button
                type="button"
                className="px-3 py-2 rounded border border-border bg-card text-card-foreground"
                onClick={() => toast.success('PDF downloaded')}
            >
                Fire success
            </button>
            <button
                type="button"
                className="px-3 py-2 rounded border border-border bg-card text-card-foreground"
                onClick={() => toast.error('Upload failed')}
            >
                Fire error
            </button>
            <button
                type="button"
                className="px-3 py-2 rounded border border-border bg-card text-card-foreground"
                onClick={() => toast.loading('Generating PDF…')}
            >
                Fire loading
            </button>
        </div>
    );
}

/**
 * Default — bottom-right toaster styled with theme tokens. Click any button
 * to fire a toast variant.
 */
export const Default: Story = {
    render: () => (
        <div className="min-h-[420px] min-w-[480px] p-6">
            <ButtonRow />
            <Editor.Toaster />
        </div>
    ),
};

/**
 * Variants — fire the three canonical toast types (success, error, loading)
 * and the default text variant. All inherit the bundled theme-token
 * background/border/text colors so dark mode flips automatically.
 */
export const Variants: Story = {
    render: () => (
        <div className="min-h-[420px] min-w-[480px] p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
                Each toast inherits theme tokens via `rgb(var(--card))` etc., so dark mode
                flips them along with the rest of the editor.
            </p>
            <ButtonRow />
            <Editor.Toaster />
        </div>
    ),
};

/**
 * Top-center — pass any `position` from `react-hot-toast` to relocate the
 * stack. All other styling carries through.
 */
export const TopCenter: Story = {
    render: () => (
        <div className="min-h-[420px] min-w-[480px] p-6">
            <ButtonRow />
            <Editor.Toaster position="top-center" />
        </div>
    ),
};
