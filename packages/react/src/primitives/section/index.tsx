'use client';

import { useEditorSection } from '../../context/editor';
import { ImageSectionView } from './image-section';
import { TextSectionView } from './text-section';

/**
 * Section primitive. Discriminates on `section.type` and renders the
 * matching variant view:
 *
 * - `'image'` → {@link ImageSectionView}
 * - `'text'` → {@link TextSectionView}
 *
 * Both variants read their data + handlers from {@link useEditorSection},
 * which must be invoked inside the per-section provider that
 * `Editor.Canvas` sets up.
 */
export function Section() {
    const { section } = useEditorSection();
    if (section.type === 'text') {
        return <TextSectionView />;
    }
    return <ImageSectionView />;
}
