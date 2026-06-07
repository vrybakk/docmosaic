import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const setThemeMock = vi.fn();
const useThemeMock = vi.fn();

vi.mock('next-themes', () => ({
    useTheme: () => useThemeMock(),
}));

import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
    afterEach(() => {
        setThemeMock.mockReset();
        useThemeMock.mockReset();
    });

    it('calls setTheme("dark") when the resolved theme is light', () => {
        useThemeMock.mockReturnValue({ resolvedTheme: 'light', setTheme: setThemeMock });
        render(<ThemeToggle />);
        fireEvent.click(screen.getByRole('button'));
        expect(setThemeMock).toHaveBeenCalledExactlyOnceWith('dark');
    });

    it('calls setTheme("light") when the resolved theme is dark', () => {
        useThemeMock.mockReturnValue({ resolvedTheme: 'dark', setTheme: setThemeMock });
        render(<ThemeToggle />);
        fireEvent.click(screen.getByRole('button'));
        expect(setThemeMock).toHaveBeenCalledExactlyOnceWith('light');
    });

    it('uses an aria-label that reflects the current theme', () => {
        useThemeMock.mockReturnValue({ resolvedTheme: 'light', setTheme: setThemeMock });
        render(<ThemeToggle />);
        expect(screen.getByRole('button').getAttribute('aria-label')).toBe(
            'Switch to dark mode',
        );
    });
});
