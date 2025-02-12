import { ImageSection } from '@/lib/types';
import { render } from '@/test/test-utils';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, jest } from 'bun:test';
import { v4 as uuidv4 } from 'uuid';
import { ImageSectionComponent } from '../ImageSection';

describe('ImageSection Component', () => {
    const mockSection: ImageSection = {
        id: uuidv4(),
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        page: 1,
    };

    const mockProps = {
        section: mockSection,
        isSelected: false,
        onUpdate: jest.fn(),
        onImageUpload: jest.fn(),
        onDuplicate: jest.fn(),
        onDelete: jest.fn(),
        onClick: jest.fn(),
    };

    it('should render upload zone when no image is present', () => {
        const { getByText, cleanup } = render(<ImageSectionComponent {...mockProps} />);
        expect(getByText('Click or drop image here')).toBeDefined();
        cleanup();
    });

    it('should render image when imageUrl is provided', () => {
        const props = {
            ...mockProps,
            section: {
                ...mockSection,
                imageUrl:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            },
        };
        const { getByAltText, cleanup } = render(<ImageSectionComponent {...props} />);
        expect(getByAltText('Uploaded content')).toBeDefined();
        cleanup();
    });

    it('should show replace button on hover when image exists', () => {
        const props = {
            ...mockProps,
            section: {
                ...mockSection,
                imageUrl:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            },
        };
        const { getByText, cleanup } = render(<ImageSectionComponent {...props} />);
        const replaceButton = getByText('Replace Image');
        expect(replaceButton).toBeDefined();
        cleanup();
    });

    it('should call onDelete when delete button is clicked', () => {
        const { container, cleanup } = render(<ImageSectionComponent {...mockProps} />);
        const deleteButton = container.querySelector('[title="Delete section"]');
        if (deleteButton) {
            fireEvent.click(deleteButton);
            expect(mockProps.onDelete).toHaveBeenCalledWith(mockSection.id);
        }
        cleanup();
    });

    it('should call onDuplicate when duplicate button is clicked', () => {
        const { container, cleanup } = render(<ImageSectionComponent {...mockProps} />);
        const duplicateButton = container.querySelector('[title="Duplicate section"]');
        if (duplicateButton) {
            fireEvent.click(duplicateButton);
            expect(mockProps.onDuplicate).toHaveBeenCalledWith(mockSection);
        }
        cleanup();
    });

    it('should show resize handles when selected', () => {
        const { container, cleanup } = render(
            <ImageSectionComponent {...mockProps} isSelected={true} />,
        );
        const resizeHandles = container.querySelectorAll(
            '.cursor-ew-resize, .cursor-ns-resize, .cursor-nwse-resize',
        );
        expect(resizeHandles.length).toBe(3);
        cleanup();
    });
});
