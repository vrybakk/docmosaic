import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Bundled DocMosaic look (base + brand theme). Sets the `--editor-color-*`
// tokens consumed by the Tailwind `editor-*` utilities used in the primitives.
import '@docmosaic/react/styles.css';
import './preview.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: 'editor',
            values: [
                { name: 'editor', value: '#f3f4f6' },
                { name: 'white', value: '#ffffff' },
                { name: 'dark', value: '#1f2937' },
            ],
        },
        layout: 'padded',
        docs: {
            toc: true,
        },
    },
    decorators: [
        withThemeByClassName({
            themes: {
                DocMosaic: 'theme-docmosaic',
                'DocMosaic Dark': 'theme-docmosaic dark',
                Minimal: 'theme-minimal',
            },
            defaultTheme: 'DocMosaic',
        }),
        (Story) => (
            <DndProvider backend={HTML5Backend}>
                <div className="docmosaic-story-surface">
                    <Story />
                </div>
            </DndProvider>
        ),
    ],
    tags: ['autodocs'],
};

export default preview;
