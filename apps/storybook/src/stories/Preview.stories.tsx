import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Editor, useEditor } from '@docmosaic/react';

import { createMockPdfBackend } from '../helpers/mock-pdf-backend';
import { documentWithSections, emptyDocument } from '../helpers/sample-documents';

/**
 * `Editor.Preview` is a Radix dialog that renders the generated PDF in an
 * `<embed>`. Reads open state, the document, and the active PDF backend
 * from `useEditor`.
 */
const meta: Meta<typeof Editor.Preview> = {
    title: 'Editor/Preview',
    component: Editor.Preview,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Editor.Preview>;

/** Auto-open the preview on mount so the dialog is visible in the frame. */
function OpenOnMount() {
    const { ui } = useEditor();
    useEffect(() => {
        ui.openPreview();
    }, [ui]);
    return null;
}

/** Preview opened with a sample document. Uses the mock backend. */
export const OpenWithContent: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithSections()}
            pdf={createMockPdfBackend()}
        >
            <Editor.Inspector />
            <OpenOnMount />
            <Editor.Preview />
        </Editor.Root>
    ),
};

/** Preview while still generating — the mock backend resolves immediately,
 * so this primarily documents the loading affordance. */
export const Generating: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithSections()}
            pdf={{
                generate: () =>
                    new Promise<Blob>((resolve) => {
                        setTimeout(
                            () =>
                                resolve(new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' })),
                            3000,
                        );
                    }),
                estimate: () => 1024,
            }}
        >
            <Editor.Inspector />
            <OpenOnMount />
            <Editor.Preview />
        </Editor.Root>
    ),
};

/** Preview opened on an empty document. */
export const Empty: Story = {
    render: () => (
        <Editor.Root defaultDocument={emptyDocument()} pdf={createMockPdfBackend()}>
            <Editor.Inspector />
            <OpenOnMount />
            <Editor.Preview />
        </Editor.Root>
    ),
};
