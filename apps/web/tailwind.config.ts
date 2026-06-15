import type { Config } from 'tailwindcss';
import { DOCMOSAIC_COLORS } from './src/lib/pdf-editor/constants/theme';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        '*.{js,ts,jsx,tsx,mdx}',
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '../../packages/react/src/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                border: 'rgb(var(--border) / <alpha-value>)',
                input: 'rgb(var(--input) / <alpha-value>)',
                ring: 'rgb(var(--ring) / <alpha-value>)',
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                primary: {
                    DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                    foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                    foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
                    foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
                    foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
                },
                popover: {
                    DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
                    foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
                },
                card: {
                    DEFAULT: 'rgb(var(--card) / <alpha-value>)',
                    foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
                },
                docmosaic: {
                    cream: DOCMOSAIC_COLORS.cream,
                    purple: DOCMOSAIC_COLORS.purple,
                    sage: DOCMOSAIC_COLORS.sage,
                    white: DOCMOSAIC_COLORS.white,
                    black: DOCMOSAIC_COLORS.black,
                    orange: DOCMOSAIC_COLORS.orange,
                    caramel: DOCMOSAIC_COLORS.caramel,
                    gradient:
                        'linear-gradient(90deg, rgba(196,214,176,0.9) 0%, rgba(252,222,156,0.8) 35%, rgba(255,165,82,0.8) 65%, rgba(186,86,36,0.9) 100%)',
                },
            },
            backgroundImage: {
                gradient:
                    'linear-gradient(90deg, rgba(196,214,176,0.9) 0%, rgba(252,222,156,0.8) 35%, rgba(255,165,82,0.8) 65%, rgba(186,86,36,0.9) 100%)',
            },
            fontFamily: {
                sans: ['var(--font-montserrat)', 'sans-serif'],
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
