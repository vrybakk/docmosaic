import { render as rtlRender } from '@testing-library/react';
import { Window } from 'happy-dom';
import { ReactElement } from 'react';

// Create a new window instance
const window = new Window({
    url: 'http://localhost',
    width: 1024,
    height: 768,
});

// Set up global variables
declare global {
    interface Window {
        __TEST_ENV__?: boolean;
    }
    interface Document {
        __TEST_ENV__?: boolean;
    }
    interface Navigator {
        __TEST_ENV__?: boolean;
    }
    interface HTMLCanvasElement {
        __TEST_ENV__?: boolean;
    }
    interface ResizeObserver {
        __TEST_ENV__?: boolean;
    }
}

(globalThis.window as any) = window;
(globalThis.document as any) = window.document;
(globalThis.navigator as any) = window.navigator;

// Mock canvas context
const mockCanvasContext = {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x: number, y: number, w: number, h: number) => ({
        data: new Array(w * h * 4),
    }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    transform: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    closePath: () => {},
};

// Mock canvas element
class MockCanvas extends window.HTMLElement {
    getContext() {
        return mockCanvasContext;
    }
}
window.customElements.define('mock-canvas', MockCanvas);
globalThis.HTMLCanvasElement = MockCanvas as unknown as typeof HTMLCanvasElement;

// Mock ResizeObserver
class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock window methods
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: () => '',
    }),
});

Object.defineProperty(window, 'matchMedia', {
    value: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
    }),
});

function render(ui: ReactElement) {
    const container = window.document.createElement('div');
    window.document.body.appendChild(container);

    const result = rtlRender(ui, {
        container: container as unknown as HTMLElement,
    });

    return {
        ...result,
        cleanup: () => {
            window.document.body.removeChild(container);
        },
    };
}

export * from '@testing-library/react';
export { render };
