import type { Config } from 'tailwindcss';

/*
 * Storybook needs its own Tailwind build so the utility classes used by
 * `@docmosaic/react` primitives resolve. The shadcn semantic color surface
 * (`background`, `primary`, `secondary`, `muted`, `accent`, `destructive`,
 * `card`, `border`, `input`, `ring`) is supplied by `@docmosaic/react`'s
 * bundled themes via RGB triplets on `:root`, so theme switching at the addon
 * level works against the same token surface that `@docmosaic/react/styles.css`
 * ships.
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
