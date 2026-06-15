/**
 * Shared sample documents used across stories. Keep these small and pure so
 * argTypes/controls don't need to recreate state on every render.
 */

import { createDocument, createPage, createSection } from '@docmosaic/core';
import type {
    Document,
    DrawingSection,
    FrameSection,
    ImageSection,
    ShapeKind,
    ShapeSection,
    Stroke,
    TextSection,
} from '@docmosaic/core';

/**
 * Tiny transparent PNG used to fill section.imageData in demo documents.
 * Keeping the data URL inline avoids fetch/network in the preview iframe.
 */
const PLACEHOLDER_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Empty document — fresh A4 portrait. */
export function emptyDocument(): Document {
    return createDocument();
}

/** Document with two image sections placed on page 1. */
export function documentWithSections(): Document {
    const base = createDocument();
    const sectionA = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    const sectionB = createSection({ x: 220, y: 320, page: 1 }) as ImageSection;
    return {
        ...base,
        sections: [
            { ...sectionA, imageUrl: PLACEHOLDER_PNG, width: 220, height: 160 },
            { ...sectionB, imageUrl: PLACEHOLDER_PNG, width: 180, height: 220 },
        ],
    };
}

/** Document with a single text section on page 1. */
export function documentWithTextSection(text = 'Hello DocMosaic'): Document {
    const base = createDocument();
    const section = createSection({ type: 'text', x: 60, y: 60, page: 1 }) as TextSection;
    return {
        ...base,
        sections: [{ ...section, text, width: 320, height: 80, fontSize: 24 }],
    };
}

/** Document with N pages. Useful for `Editor.Pages` stories. */
export function documentWithPages(count: number): Document {
    const base = createDocument();
    const extra = Math.max(0, count - 1);
    return {
        ...base,
        totalPages: 1 + extra,
        pages: [...base.pages, ...Array.from({ length: extra }, () => createPage())],
    };
}

/**
 * Document with a single shape section on page 1.
 *
 * @remarks
 * Override stroke/fill/width via the partial — defaults match the factory
 * (`fill: 'transparent'`, `stroke: '#000'`, `strokeWidth: 1`).
 */
export function documentWithShapeSection(
    shape: ShapeKind,
    overrides: Partial<ShapeSection> = {},
): Document {
    const base = createDocument();
    const section = createSection({ type: 'shape', shape, x: 60, y: 60, page: 1 }) as ShapeSection;
    return {
        ...base,
        sections: [
            {
                ...section,
                width: 260,
                height: 180,
                ...overrides,
            },
        ],
    };
}

/**
 * Document with a single drawing section seeded with a couple of strokes —
 * useful for previewing the drawing renderer without entering drawing mode.
 */
export function documentWithDrawingSection(
    strokes: Stroke[] = [
        {
            color: '#c97b22',
            weight: 3,
            points: [
                { x: 80, y: 90 },
                { x: 120, y: 140 },
                { x: 160, y: 100 },
                { x: 200, y: 150 },
                { x: 240, y: 110 },
            ],
        },
        {
            color: '#3b6e3b',
            weight: 2,
            points: [
                { x: 100, y: 220 },
                { x: 140, y: 200 },
                { x: 180, y: 230 },
                { x: 220, y: 210 },
            ],
        },
    ],
): Document {
    const base = createDocument();
    const section = createSection({ type: 'drawing', x: 60, y: 60, page: 1 }) as DrawingSection;
    return {
        ...base,
        sections: [
            {
                ...section,
                x: 60,
                y: 60,
                width: 360,
                height: 260,
                strokes,
            },
        ],
    };
}

/**
 * Document with three image sections arranged in a row — useful for the
 * Phase 16 multi-select + snap stories.
 */
export function documentWithThreeSections(): Document {
    const base = createDocument();
    const a = createSection({ x: 40, y: 40, page: 1 }) as ImageSection;
    const b = createSection({ x: 240, y: 40, page: 1 }) as ImageSection;
    const c = createSection({ x: 40, y: 240, page: 1 }) as ImageSection;
    return {
        ...base,
        sections: [
            { ...a, width: 160, height: 120 },
            { ...b, width: 160, height: 120 },
            { ...c, width: 160, height: 120 },
        ],
    };
}

/** Document with a colored page background and a single image section. */
export function documentWithPageBackground(color = '#fff7e6'): Document {
    const base = createDocument();
    const section = createSection({ x: 60, y: 60, page: 1 }) as ImageSection;
    return {
        ...base,
        pages: base.pages.map((p, i) => (i === 0 ? { ...p, background: { color } } : p)),
        sections: [{ ...section, width: 220, height: 160 }],
    };
}

/**
 * Document with one cropped image section — exercises the
 * `ImageCrop` render path in both the editor preview and the PDF/PNG
 * pipelines.
 */
export function documentWithCroppedImage(): Document {
    const base = createDocument();
    const section = createSection({ x: 60, y: 60, page: 1 }) as ImageSection;
    return {
        ...base,
        sections: [
            {
                ...section,
                imageUrl: PLACEHOLDER_PNG,
                width: 320,
                height: 220,
                crop: { x: 60, y: 40, width: 200, height: 160 },
            },
        ],
    };
}

/**
 * Document with a container {@link FrameSection} that owns two child sections
 * (linked by `parentFrameId`). Exercises the frame render + flat-parenting model.
 */
export function documentWithFrameSection(): Document {
    const base = createDocument();
    const frame = createSection({ type: 'frame', x: 40, y: 40, page: 1 }) as FrameSection;
    const frameBox: FrameSection = {
        ...frame,
        width: 320,
        height: 220,
        fill: '#ffffff',
        stroke: '#e5e5e5',
    };
    const child = createSection({ x: 0, y: 0, page: 1 }) as ImageSection;
    const caption = createSection({ type: 'text', x: 0, y: 0, page: 1 }) as TextSection;
    return {
        ...base,
        sections: [
            frameBox,
            {
                ...child,
                parentFrameId: frameBox.id,
                imageUrl: PLACEHOLDER_PNG,
                x: 60,
                y: 70,
                width: 130,
                height: 100,
            },
            {
                ...caption,
                parentFrameId: frameBox.id,
                text: 'Inside the frame',
                x: 60,
                y: 190,
                width: 220,
                height: 40,
                fontSize: 18,
            },
        ],
    };
}

/**
 * Document with a single placeholder (image-mask) frame on page 1 — an
 * `ImageSection` whose `maskShape` clips the image to a shape.
 */
export function documentWithMaskedImage(maskShape: ShapeKind = 'circle'): Document {
    const base = createDocument();
    const section = createSection({ x: 80, y: 80, page: 1 }) as ImageSection;
    return {
        ...base,
        sections: [{ ...section, imageUrl: PLACEHOLDER_PNG, width: 200, height: 200, maskShape }],
    };
}
