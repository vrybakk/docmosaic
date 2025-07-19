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
    ],
    theme: {
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
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
            fontFamily: {
                sans: ['var(--font-montserrat)', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require('tailwindcss-animate')],
};

export default config;
