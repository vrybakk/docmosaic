/// <reference types="bun-types" />

import { cleanup } from '@testing-library/react';
import { afterEach } from 'bun:test';
import { Window } from 'happy-dom';

// Create a new window instance
const window = new Window({
    url: 'http://localhost',
});

// Configure testing environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Basic DOM setup
globalThis.window = window;
globalThis.document = window.document;

// Basic canvas mock
const mockCanvasContext = {
    drawImage: () => {},
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(0) }),
    putImageData: () => {},
    createImageData: () => {},
    setTransform: () => {},
    save: () => {},
    restore: () => {},
};

class MockCanvas extends window.HTMLElement {
    getContext() {
        return mockCanvasContext;
    }
}

// Register custom elements
window.customElements.define('canvas', MockCanvas);

// Basic ResizeObserver mock
class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Add required window methods
Object.defineProperty(window, 'ResizeObserver', { value: MockResizeObserver });
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({ getPropertyValue: () => '' }),
});
Object.defineProperty(window, 'matchMedia', {
    value: () => ({
        matches: false,
        addListener: () => {},
        removeListener: () => {},
    }),
});

// Create root element for React Testing Library
const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

// Cleanup after each test
afterEach(() => {
    cleanup();
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }
});
