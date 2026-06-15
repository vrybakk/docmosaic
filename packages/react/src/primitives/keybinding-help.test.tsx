/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Editor } from '../index';

function setup(props: Parameters<typeof Editor.KeybindingHelp>[0] = {}) {
    return render(
        <Editor.Root>
            <Editor.KeybindingHelp {...props} />
        </Editor.Root>,
    );
}

describe('Editor.KeybindingHelp', () => {
    let originalPlatform: string;

    beforeEach(() => {
        originalPlatform = navigator.platform;
        Object.defineProperty(navigator, 'platform', {
            value: 'MacIntel',
            configurable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'platform', {
            value: originalPlatform,
            configurable: true,
        });
    });

    it('renders nothing visible until the chord is pressed', () => {
        setup();
        // Dialog content lives in a portal, so before opening the title text
        // shouldn't appear anywhere in the document.
        expect(screen.queryByText('Keyboard shortcuts')).toBeNull();
    });

    it('opens on Cmd+/ and lists the default keymap', () => {
        setup();

        act(() => {
            fireEvent.keyDown(window, { key: '/', metaKey: true });
        });

        expect(screen.getByText('Keyboard shortcuts')).toBeTruthy();
        // Hits one row from every group to confirm the grouping is rendered.
        expect(screen.getByText('Undo')).toBeTruthy();
        expect(screen.getByText('Clear selection')).toBeTruthy();
        expect(screen.getByText('Nudge up (1pt)')).toBeTruthy();
        expect(screen.getByText('Nudge right (10pt)')).toBeTruthy();
        expect(screen.getByText('Show keyboard shortcuts')).toBeTruthy();
    });

    it('renders mac modifier glyphs in <kbd> chips', () => {
        setup();

        act(() => {
            fireEvent.keyDown(window, { key: '/', metaKey: true });
        });

        // Undo on macOS reads as ⌘ Z.
        const kbds = Array.from(document.querySelectorAll('kbd'));
        const labels = kbds.map((k) => k.textContent);
        expect(labels).toContain('⌘');
        expect(labels).toContain('Z');
        expect(labels).toContain('⇧');
    });

    it('respects an externally controlled open prop', () => {
        const { rerender } = render(
            <Editor.Root>
                <Editor.KeybindingHelp open={false} />
            </Editor.Root>,
        );
        expect(screen.queryByText('Keyboard shortcuts')).toBeNull();

        rerender(
            <Editor.Root>
                <Editor.KeybindingHelp open />
            </Editor.Root>,
        );
        expect(screen.getByText('Keyboard shortcuts')).toBeTruthy();
    });

    it('honors a custom showHelp binding from the keymap prop', () => {
        setup({ keymap: { showHelp: 'mod+k' } });

        // The default mod+/ should no longer open the dialog.
        act(() => {
            fireEvent.keyDown(window, { key: '/', metaKey: true });
        });
        expect(screen.queryByText('Keyboard shortcuts')).toBeNull();

        // The override does.
        act(() => {
            fireEvent.keyDown(window, { key: 'k', metaKey: true });
        });
        expect(screen.getByText('Keyboard shortcuts')).toBeTruthy();
    });

    it('does not open while focus is in an input', () => {
        setup();
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        try {
            fireEvent.keyDown(input, { key: '/', metaKey: true });
            expect(screen.queryByText('Keyboard shortcuts')).toBeNull();
        } finally {
            document.body.removeChild(input);
        }
    });
});
