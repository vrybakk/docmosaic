/// <reference types="bun-types" />

import { cleanup } from '@testing-library/react';
import { afterEach } from 'bun:test';
import { Window } from 'happy-dom';

// Create a new window instance
const window = new Window({
    url: 'http://localhost',
});

// Set up global variables
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = window.navigator;
(global as any).HTMLCanvasElement = window.HTMLCanvasElement;

// Configure testing environment
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock canvas context
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

// Mock HTMLCanvasElement
(global as any).HTMLCanvasElement.prototype.getContext = function () {
    return mockCanvasContext;
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Add missing DOM APIs
(global as any).window.getComputedStyle = () => ({
    getPropertyValue: () => '',
});

(global as any).window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
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
