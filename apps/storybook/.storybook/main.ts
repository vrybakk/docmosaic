import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    stories: [
        '../src/docs/**/*.mdx',
        '../src/stories/**/*.stories.@(ts|tsx|mdx)',
    ],
    addons: [
        '@storybook/addon-essentials',
        '@storybook/addon-a11y',
        '@storybook/addon-themes',
        '@storybook/addon-interactions',
    ],
    docs: {
        autodocs: 'tag',
    },
    typescript: {
        check: false,
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) =>
                prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
        },
    },
};

export default config;
