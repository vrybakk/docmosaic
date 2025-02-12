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
Object.defineProperty(globalThis, 'window', {
    value: window,
    writable: true,
});

Object.defineProperty(globalThis, 'document', {
    value: window.document,
    writable: true,
});

Object.defineProperty(globalThis, 'navigator', {
    value: window.navigator,
    writable: true,
});

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
(window as any).HTMLCanvasElement = MockCanvas;

// Mock ResizeObserver
class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(window as any).ResizeObserver = MockResizeObserver;

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
        container,
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
