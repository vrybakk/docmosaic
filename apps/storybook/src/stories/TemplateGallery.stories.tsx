import type { Meta, StoryObj } from '@storybook/react';
import { Editor, type TemplateGalleryItem } from '@docmosaic/react';

import {
    documentWithCroppedImage,
    documentWithPageBackground,
    documentWithSections,
    documentWithTextSection,
} from '../helpers/sample-documents';

/**
 * `Editor.TemplateGallery` — clicking a card swaps the document via
 * `actions.loadDocument`, which in uncontrolled mode is captured by the
 * history timeline so undo restores the previous document.
 */
const meta: Meta = {
    title: 'Editor/Template Gallery',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj;

const templates: TemplateGalleryItem[] = [
    {
        id: 'tpl-blank-with-text',
        name: 'Title page',
        document: documentWithTextSection('Welcome to DocMosaic'),
    },
    {
        id: 'tpl-image-gallery',
        name: 'Image gallery',
        document: documentWithSections(),
    },
    {
        id: 'tpl-cropped-photo',
        name: 'Cropped photo',
        document: documentWithCroppedImage(),
    },
    {
        id: 'tpl-colored',
        name: 'Coloured page',
        document: documentWithPageBackground('#fde9d2'),
    },
];

/** Gallery rendered alongside an Editor.Root — pick a template to load it. */
export const Default: Story = {
    render: () => (
        <Editor.Root>
            <div className="flex flex-col gap-4 p-4" style={{ minHeight: 600 }}>
                <h2 className="text-lg font-semibold">Choose a template</h2>
                <Editor.TemplateGallery templates={templates} />
                <div style={{ height: 400, display: 'flex' }}>
                    <Editor.Canvas>
                        <Editor.Section />
                    </Editor.Canvas>
                </div>
            </div>
        </Editor.Root>
    ),
};
