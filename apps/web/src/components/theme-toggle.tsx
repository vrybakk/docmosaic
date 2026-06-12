'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Sun/moon icon button that flips between light and dark via `next-themes`.
 * Hydration-safe: returns a same-shaped placeholder on the server pass so the
 * `resolvedTheme` mismatch doesn't trigger a React hydration warning.
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={mounted && isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
        >
            {mounted && isDark ? (
                <Sun className="h-5 w-5" strokeWidth={1.5} />
            ) : (
                <Moon className="h-5 w-5" strokeWidth={1.5} />
            )}
        </button>
    );
}
