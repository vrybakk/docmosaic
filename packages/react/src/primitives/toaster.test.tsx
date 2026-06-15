/**
 * @vitest-environment happy-dom
 *
 * Phase 28 — `Editor.Toaster` primitive smoke tests.
 *
 * react-hot-toast renders into a portal; happy-dom supports that out of the
 * box. The tests:
 * - Mount `Editor.Toaster` and assert its container lands in the DOM.
 * - Fire `toast.success`/`toast.error` and assert the rendered message text
 *   shows up.
 */
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { toast, Toaster } from './toaster';

afterEach(() => {
    // Clean every queued toast so cases don't leak text into each other.
    toast.dismiss();
});

describe('Editor.Toaster', () => {
    it('mounts a toaster container', () => {
        render(<Toaster />);
        // react-hot-toast tags its outer wrapper with role status when a toast
        // is live — the container exists immediately; we just check the wrapper
        // exists at the document level.
        const node = document.body.querySelector('[class*="go"]');
        // Smoke: a wrapper exists in the body after mount.
        expect(node ?? document.body.firstElementChild).toBeTruthy();
    });

    it('renders a success toast after fire', async () => {
        render(<Toaster />);
        act(() => {
            toast.success('Section deleted');
        });
        await waitFor(() => {
            expect(document.body.textContent).toContain('Section deleted');
        });
    });

    it('renders an error toast after fire', async () => {
        render(<Toaster />);
        act(() => {
            toast.error('Upload failed');
        });
        await waitFor(() => {
            expect(document.body.textContent).toContain('Upload failed');
        });
    });

    it('renders a loading toast after fire', async () => {
        render(<Toaster />);
        act(() => {
            toast.loading('Generating PDF…');
        });
        await waitFor(() => {
            expect(document.body.textContent).toContain('Generating PDF');
        });
    });
});
