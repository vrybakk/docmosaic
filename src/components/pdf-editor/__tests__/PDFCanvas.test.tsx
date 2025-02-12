import { ImageSection } from '@/lib/types';
import { render } from '@testing-library/react';
import { describe, expect, it, jest } from 'bun:test';
import { PDFCanvas } from '../PDFCanvas';

describe('PDFCanvas', () => {
    const mockSection: ImageSection = {
        id: '1',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        page: 1,
    };

    const defaultProps = {
        sections: [mockSection],
        onSectionUpdate: jest.fn(),
        onImageUpload: jest.fn(),
        onDuplicate: jest.fn(),
        onDelete: jest.fn(),
        backgroundPDF: null,
        currentPage: 1,
        pageSize: {
            width: 794,
            height: 1123,
            unit: 'px',
        },
    };

    it('renders correctly', () => {
        const { container } = render(<PDFCanvas {...defaultProps} />);
        expect(container.querySelector('[data-testid="image-section"]')).toBeDefined();
    });

    it('renders only sections for current page', () => {
        const sections = [mockSection, { ...mockSection, id: '2', page: 2 }];
        const { container } = render(
            <PDFCanvas {...defaultProps} sections={sections} currentPage={1} />,
        );
        const renderedSections = container.querySelectorAll('[data-testid="image-section"]');
        expect(renderedSections.length).toBe(1);
    });

    it('shows background when provided', () => {
        const { container } = render(<PDFCanvas {...defaultProps} backgroundPDF="test.pdf" />);
        const canvas = container.querySelector('div[style*="backgroundImage"]');
        expect(canvas).toBeDefined();
    });
});
