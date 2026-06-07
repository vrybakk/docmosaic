import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { Document } from '@docmosaic/core';
import { Editor } from '@docmosaic/react';

import { createMockPdfBackend } from '../helpers/mock-pdf-backend';
import {
    documentWithDrawingSection,
    documentWithSections,
    emptyDocument,
} from '../helpers/sample-documents';

/**
 * `Editor.Root` is the orchestrator: it owns the DnD provider, the editor
 * config (image renderer), and either internal or external document state.
 * It also arranges the bundled primitives (`Header`, `Toolbar`, `PageList`,
 * `Canvas`, `Preview`) into the editor's default shell.
 */
const meta: Meta<typeof Editor.Root> = {
    title: 'Editor/Root',
    component: Editor.Root,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        pdf: {
            description:
                'Pluggable PDF backend. Pass `{ generate, estimate }` to swap the jsPDF path for a custom renderer.',
            control: false,
        },
        keybindings: {
            description:
                'Partial keymap overrides or `false` to disable shortcuts entirely.',
            control: false,
        },
        defaultDocument: {
            description: 'Seed document used in uncontrolled mode.',
            control: false,
        },
        onDocumentChange: {
            description: 'Required when running in controlled mode.',
            control: false,
        },
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Root>;

/** Empty editor with the bundled shell. */
export const Default: Story = {
    args: {
        children: (
            <>
                <Editor.Header />
                <Editor.Toolbar />
                <Editor.PageList />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
};

/** Editor seeded with two image sections on page 1. */
export const WithSections: Story = {
    args: {
        defaultDocument: documentWithSections(),
        children: (
            <>
                <Editor.Header />
                <Editor.Toolbar />
                <Editor.PageList />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
};

/** Controlled mode — the parent owns the document and rerenders on every change. */
export const Controlled: Story = {
    render: () => {
        function ControlledExample() {
            const [doc, setDoc] = useState<Document>(emptyDocument());
            return (
                <Editor.Root document={doc} onDocumentChange={setDoc}>
                    <Editor.Header />
                    <Editor.Toolbar />
                    <Editor.PageList />
                    <Editor.Canvas />
                    <Editor.Preview />
                </Editor.Root>
            );
        }
        return <ControlledExample />;
    },
};

/** Custom PDF backend wired via the `pdf` prop. The mock resolves instantly. */
export const CustomPdfBackend: Story = {
    args: {
        pdf: createMockPdfBackend(),
        children: (
            <>
                <Editor.Header />
                <Editor.Toolbar />
                <Editor.PageList />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
};

/** Same primitives, rendered against the minimal (non-brand) theme. */
export const MinimalTheme: Story = {
    args: {
        defaultDocument: documentWithSections(),
        children: (
            <>
                <Editor.Header />
                <Editor.Toolbar />
                <Editor.PageList />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
    parameters: {
        themes: { themeOverride: 'minimal' },
    },
};

/**
 * Drawing mode active — the canvas captures pointer drags as strokes and the
 * `Editor.DrawingControls` panel exposes color, brush weight, and clear/done.
 * Drag inside the canvas to author a new freehand stroke.
 */
export const DrawingMode: Story = {
    render: function DrawingModeStory() {
        return (
            <Editor.Root defaultDocument={documentWithDrawingSection([])}>
                <Editor.Header />
                <Editor.Toolbar>
                    <div className="flex items-center gap-2">
                        <Editor.UndoButton />
                        <Editor.RedoButton />
                        <Editor.DrawButton />
                    </div>
                </Editor.Toolbar>
                <div className="flex-1 min-h-0 flex gap-3 p-3">
                    <Editor.DrawingControls />
                    <Editor.Canvas>
                        <Editor.Section />
                    </Editor.Canvas>
                </div>
            </Editor.Root>
        );
    },
};

/** Keybindings disabled — no window listener is attached. */
export const KeybindingsDisabled: Story = {
    args: {
        keybindings: false,
        children: (
            <>
                <Editor.Header />
                <Editor.Toolbar />
                <Editor.PageList />
                <Editor.Canvas />
                <Editor.Preview />
            </>
        ),
    },
};
