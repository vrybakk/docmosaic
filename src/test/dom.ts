import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
});

// Set up a mock window object
Object.defineProperty(global, 'window', {
    value: dom.window,
    writable: true
});
global.document = dom.window.document;
global.navigator = {
    userAgent: 'node.js',
} as Navigator;
