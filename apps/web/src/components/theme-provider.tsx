'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import type React from 'react';

/**
 * Client-side wrapper around `next-themes`. `attribute="class"` toggles a
 * `.dark` class on `<html>`, which both Tailwind's `darkMode: ['class']` and
 * the `.dark` scope in `@docmosaic/react`'s shipped `docmosaic.css` consume.
 *
 * The marketing site is a light-only brand surface - its blocks hardcode the
 * warm DocMosaic palette and were never designed for a dark canvas. So every
 * route except the editor is pinned to light via `forcedTheme`; only
 * `/pdf-editor` honors the system preference and the in-editor theme toggle.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isEditor = pathname?.startsWith('/pdf-editor') ?? false;

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            forcedTheme={isEditor ? undefined : 'light'}
        >
            {children}
        </NextThemesProvider>
    );
}
