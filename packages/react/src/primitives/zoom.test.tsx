/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Editor } from '../index';

/**
 * Mount `Editor.Zoom` inside a canvas. Returns a helper that scopes queries to
 * the `data-zoom-controls` strip — the bundled `CanvasControls` also surfaces
 * a zoom percentage / +/- buttons inside the same canvas, so `screen.*` would
 * see duplicates without scoping.
 */
function setup() {
    const utils = render(
        <Editor.Root>
            <Editor.Canvas>
                <Editor.Section />
                <Editor.Zoom />
            </Editor.Canvas>
        </Editor.Root>,
    );

    const zoomStrip = () => {
        const el = utils.container.querySelector('[data-zoom-controls="true"]');
        if (!el) throw new Error('Editor.Zoom not mounted');
        return within(el as HTMLElement);
    };

    return { ...utils, zoomStrip };
}

/**
 * `Editor.Canvas` keeps the controls behind a 100ms `isLoading` flag while it
 * measures the container. Wait the flag out so the test isn't racing the
 * canvas mount.
 */
async function waitForZoomMounted(utils: ReturnType<typeof setup>) {
    await waitFor(() => {
        expect(utils.container.querySelector('[data-zoom-controls="true"]')).toBeTruthy();
    });
}

describe('Editor.Zoom', () => {
    it('renders the current scale as a percentage', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        const strip = utils.zoomStrip();
        // The reset/100% buttons both contain the text; getAllByText avoids
        // a duplicate-match failure when the label and the explicit "100%"
        // button both render.
        expect(strip.getAllByText('100%').length).toBeGreaterThan(0);
    });

    it('clicking zoom in increases the percentage', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        const strip = utils.zoomStrip();
        act(() => {
            fireEvent.click(strip.getByLabelText('Zoom in'));
        });
        // Default step is 0.1, so 1.0 → 1.1 → "110%".
        expect(utils.zoomStrip().getByText('110%')).toBeTruthy();
    });

    it('clicking zoom out decreases the percentage', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        act(() => {
            fireEvent.click(utils.zoomStrip().getByLabelText('Zoom out'));
        });
        expect(utils.zoomStrip().getByText('90%')).toBeTruthy();
    });

    it('clicking the percentage label resets to 100%', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        // `zoomIn` reads its current value from a closure, so each click has
        // to flush its state update before the next runs — separate act calls.
        act(() => {
            fireEvent.click(utils.zoomStrip().getByLabelText('Zoom in'));
        });
        expect(utils.zoomStrip().getByText('110%')).toBeTruthy();

        act(() => {
            fireEvent.click(utils.zoomStrip().getByLabelText(/click to reset to 100%/i));
        });
        expect(utils.zoomStrip().getAllByText('100%').length).toBeGreaterThan(0);
    });

    it('disables zoom out at the minimum', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        // Default minZoom is 0.5; 6 clicks of 0.1 each over-shoot the floor
        // (float tail) so the clamp lands at exactly 0.5 and disables the
        // button.
        for (let i = 0; i < 6; i++) {
            act(() => {
                fireEvent.click(utils.zoomStrip().getByLabelText('Zoom out'));
            });
        }
        const zoomOut = utils.zoomStrip().getByLabelText('Zoom out') as HTMLButtonElement;
        expect(zoomOut.disabled).toBe(true);
    });

    it('fit-to-screen resets the scale', async () => {
        const utils = setup();
        await waitForZoomMounted(utils);
        act(() => {
            fireEvent.click(utils.zoomStrip().getByLabelText('Zoom in'));
        });
        expect(utils.zoomStrip().getByText('110%')).toBeTruthy();

        act(() => {
            fireEvent.click(utils.zoomStrip().getByLabelText('Fit to screen'));
        });
        expect(utils.zoomStrip().getAllByText('100%').length).toBeGreaterThan(0);
    });
});
