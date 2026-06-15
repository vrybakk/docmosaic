/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker, DEFAULT_COLOR_PRESETS } from './color-picker';

describe('ColorPicker', () => {
    it('renders one swatch per preset color', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorPicker value="#000000" onChange={onChange} />);
        const swatches = container.querySelectorAll('button[aria-label^="Pick color"]');
        expect(swatches.length).toBe(DEFAULT_COLOR_PRESETS.length);
    });

    it('fires onChange with the picked color when a swatch is clicked', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorPicker value="#000000" onChange={onChange} />);
        const swatch = container.querySelector(
            'button[aria-label="Pick color #EF4444"]',
        ) as HTMLButtonElement | null;
        expect(swatch).not.toBeNull();
        if (!swatch) return;
        fireEvent.click(swatch);
        expect(onChange).toHaveBeenCalledWith('#EF4444');
    });

    it('marks the active swatch as pressed', () => {
        const { container } = render(<ColorPicker value="#EF4444" onChange={() => {}} />);
        const active = container.querySelector(
            'button[aria-label="Pick color #EF4444"]',
        ) as HTMLButtonElement | null;
        expect(active?.getAttribute('aria-pressed')).toBe('true');
    });

    it('exposes a native color input that propagates changes', () => {
        const onChange = vi.fn();
        const { container } = render(<ColorPicker value="#000000" onChange={onChange} />);
        const input = container.querySelector(
            'input[data-custom-color-input="true"]',
        ) as HTMLInputElement | null;
        expect(input).not.toBeNull();
        expect(input?.type).toBe('color');
        if (!input) return;
        fireEvent.change(input, { target: { value: '#abcdef' } });
        expect(onChange).toHaveBeenCalledWith('#abcdef');
    });

    it('opens the native color input when the custom trigger is clicked', () => {
        const { container } = render(<ColorPicker value="#000000" onChange={() => {}} />);
        const input = container.querySelector(
            'input[data-custom-color-input="true"]',
        ) as HTMLInputElement | null;
        const trigger = container.querySelector(
            'button[aria-label="Pick custom color"]',
        ) as HTMLButtonElement | null;
        expect(input).not.toBeNull();
        expect(trigger).not.toBeNull();
        if (!input || !trigger) return;
        const spy = vi.spyOn(input, 'click');
        fireEvent.click(trigger);
        expect(spy).toHaveBeenCalled();
    });
});
