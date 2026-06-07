import type { Config } from 'tailwindcss';

/*
 * Storybook needs its own Tailwind build so the `editor-*` utility classes
 * used by `@docmosaic/react` primitives (e.g. `border-editor-accent`,
 * `text-editor-text`) actually resolve. Colors are wired to the
 * `--editor-color-*` CSS variables shipped by `@docmosaic/react/styles.css`,
 * so theme switching at the addon level continues to work.
 */
const config: Config = {
    content: [
        './.storybook/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx,mdx}',
        '../../packages/react/src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                editor: {
                    accent: 'rgb(var(--editor-color-accent) / <alpha-value>)',
                    'accent-soft': 'rgb(var(--editor-color-accent-soft) / <alpha-value>)',
                    success: 'rgb(var(--editor-color-success) / <alpha-value>)',
                    warning: 'rgb(var(--editor-color-warning) / <alpha-value>)',
                    'warning-soft': 'rgb(var(--editor-color-warning-soft) / <alpha-value>)',
                    surface: 'rgb(var(--editor-color-surface) / <alpha-value>)',
                    text: 'rgb(var(--editor-color-text) / <alpha-value>)',
                },
            },
            borderRadius: {
                'editor-section': 'var(--editor-radius-section)',
            },
            boxShadow: {
                'editor-section': 'var(--editor-shadow-section)',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require('tailwindcss-animate')],
};

export default config;
