/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrushWeightSlider } from './brush-weight-slider';

describe('BrushWeightSlider', () => {
    it('renders an input with the current value', () => {
        const { container } = render(
            <BrushWeightSlider value={5} onChange={() => {}} />,
        );
        const input = container.querySelector(
            'input[type="range"]',
        ) as HTMLInputElement | null;
        expect(input).not.toBeNull();
        expect(input?.value).toBe('5');
    });

    it('fires onChange with the parsed numeric value', () => {
        const onChange = vi.fn();
        const { container } = render(
            <BrushWeightSlider value={3} onChange={onChange} />,
        );
        const input = container.querySelector(
            'input[type="range"]',
        ) as HTMLInputElement | null;
        expect(input).not.toBeNull();
        if (!input) return;
        fireEvent.change(input, { target: { value: '12' } });
        expect(onChange).toHaveBeenCalledWith(12);
    });

    it('honors min/max bounds', () => {
        const { container } = render(
            <BrushWeightSlider value={10} onChange={() => {}} min={2} max={15} />,
        );
        const input = container.querySelector(
            'input[type="range"]',
        ) as HTMLInputElement | null;
        expect(input?.min).toBe('2');
        expect(input?.max).toBe('15');
    });

    it('renders the visual preview circle sized to the current weight', () => {
        const { container } = render(
            <BrushWeightSlider value={7} onChange={() => {}} previewColor="#ff0000" />,
        );
        const preview = container.querySelector(
            '[data-brush-preview="true"] > div',
        ) as HTMLDivElement | null;
        expect(preview).not.toBeNull();
        expect(preview?.style.width).toBe('7px');
        expect(preview?.style.height).toBe('7px');
        // happy-dom keeps the hex literal; jsdom would normalize to rgb().
        // Accept either so the test stays portable.
        const bg = preview?.style.backgroundColor.toLowerCase();
        expect(bg === '#ff0000' || bg === 'rgb(255, 0, 0)').toBe(true);
    });
});
