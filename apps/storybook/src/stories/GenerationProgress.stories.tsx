import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { Editor, useEditor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * `Editor.GenerationProgress` is the inline UI shown while a PDF is being
 * generated. Renders nothing when `pdfApi.state.isGenerating` is false.
 */
const meta: Meta<typeof Editor.GenerationProgress> = {
    title: 'Editor/GenerationProgress',
    component: Editor.GenerationProgress,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Editor.GenerationProgress>;

/** Trigger a `download()` call on mount with a backend that never resolves
 * — the overlay then sees `isGenerating: true` until the story unmounts. */
function StartGenerating() {
    const { pdfApi } = useEditor();
    useEffect(() => {
        void pdfApi.download().catch(() => {
            /* swallow — the mock never resolves */
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
}

/** Generating without a known progress value. */
export const Generating: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithSections()}
            pdf={{
                generate: () => new Promise<Blob>(() => undefined),
                estimate: () => 1024,
            }}
        >
            <StartGenerating />
            <Editor.GenerationProgress />
        </Editor.Root>
    ),
};

/** Generating with a known percentage — `progress` flows through `onProgress`. */
export const GeneratingWithProgress: Story = {
    render: () => (
        <Editor.Root
            defaultDocument={documentWithSections()}
            pdf={{
                generate: (_sections, _options, onProgress) =>
                    new Promise<Blob>(() => {
                        onProgress?.({ progress: 42, stage: 'generating' });
                    }),
                estimate: () => 1024,
            }}
        >
            <StartGenerating />
            <Editor.GenerationProgress />
        </Editor.Root>
    ),
};

/** Idle — overlay renders nothing. */
export const Idle: Story = {
    render: () => (
        <Editor.Root defaultDocument={documentWithSections()}>
            <div className="text-sm text-gray-500">
                Idle — the overlay renders nothing when `isGenerating` is false.
            </div>
            <Editor.GenerationProgress />
        </Editor.Root>
    ),
};
