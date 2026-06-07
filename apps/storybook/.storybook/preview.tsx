import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import '@docmosaic/react/styles/base.css';
import '@docmosaic/react/styles/themes/docmosaic.css';
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
                { name: 'editor', value: '#f9fafb' },
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
                docmosaic: 'theme-docmosaic',
                minimal: 'theme-minimal',
            },
            defaultTheme: 'docmosaic',
        }),
        (Story) => (
            <DndProvider backend={HTML5Backend}>
                <Story />
            </DndProvider>
        ),
    ],
    tags: ['autodocs'],
};

export default preview;
