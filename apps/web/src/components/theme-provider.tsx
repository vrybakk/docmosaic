'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type React from 'react';

/**
 * Client-side wrapper around `next-themes`. `attribute="class"` toggles a
 * `.dark` class on `<html>`, which both Tailwind's `darkMode: ['class']` and
 * the `.dark` scope in `@docmosaic/react`'s shipped `docmosaic.css` consume —
 * so the marketing site and the editor flip together.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </NextThemesProvider>
    );
}
