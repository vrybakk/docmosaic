import type { Config } from 'tailwindcss';

/*
 * Storybook needs its own Tailwind build so the utility classes used by
 * `@docmosaic/react` primitives resolve. Two color surfaces are exposed:
 *
 *  - `editor.*`           — legacy DocMosaic palette (back-compat, kept for
 *                           primitives that haven't migrated yet).
 *  - shadcn semantic names (`background`, `primary`, `secondary`, `muted`,
 *                           `accent`, `destructive`, `card`, `border`, `input`,
 *                           `ring`) — the new surface, supplied by
 *                           `@docmosaic/react`'s bundled themes via RGB
 *                           triplets on `:root`.
 *
 * Both read the same `--editor-color-*` / shadcn token surface that
 * `@docmosaic/react/styles.css` ships, so theme switching at the addon level
 * continues to work for either name.
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
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                card: {
                    DEFAULT: 'rgb(var(--card) / <alpha-value>)',
                    foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
                },
                primary: {
                    DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                    foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                    foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
                    foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
                    foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
                },
                border: 'rgb(var(--border) / <alpha-value>)',
                input: 'rgb(var(--input) / <alpha-value>)',
                ring: 'rgb(var(--ring) / <alpha-value>)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
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
