'use client';

import { useEditorSection } from '../../context/editor';
import { DrawingSectionView } from './drawing-section';
import { FrameSectionView } from './frame-section';
import { ImageSectionView } from './image-section';
import { ShapeSectionView } from './shape-section';
import { TextSectionView } from './text-section';

/**
 * Section primitive. Discriminates on `section.type` and renders the
 * matching variant view:
 *
 * - `'image'` → {@link ImageSectionView}
 * - `'text'` → {@link TextSectionView}
 * - `'shape'` → {@link ShapeSectionView}
 * - `'drawing'` → {@link DrawingSectionView}
 * - `'frame'` → {@link FrameSectionView}
 *
 * All variants read their data + handlers from {@link useEditorSection},
 * which must be invoked inside the per-section provider that
 * `Editor.Canvas` sets up.
 */
export function Section() {
    const { section } = useEditorSection();
    if (section.type === 'text') {
        return <TextSectionView />;
    }
    if (section.type === 'shape') {
        return <ShapeSectionView />;
    }
    if (section.type === 'drawing') {
        return <DrawingSectionView />;
    }
    if (section.type === 'frame') {
        return <FrameSectionView />;
    }
    return <ImageSectionView />;
}
