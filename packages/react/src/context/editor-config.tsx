'use client';

/**
 * @packageDocumentation
 *
 * Editor configuration context.
 *
 * Lets consumers of the editor inject implementations for pieces that vary
 * between environments (Next.js app, embeddable React package, tests) without
 * the editor itself taking a hard dependency on framework-specific APIs.
 *
 * Today the only injectable is {@link ImageRenderer}; future phases may extend
 * {@link EditorConfig} with analytics or telemetry hooks.
 */

import {
    type ComponentType,
    type ReactNode,
    type Ref,
    createContext,
    forwardRef,
    useContext,
} from 'react';

/**
 * Props accepted by the image renderer used inside the editor.
 *
 * Matches the subset of props the editor components actually pass:
 * - `src` / `alt`: required, standard `<img>` attributes.
 * - `className`: styling hook used by both the canvas section and the sidebar thumbnail.
 * - `fill`: legacy `next/image` flag preserved for callsite parity; the default
 *   renderer ignores it because the parent already constrains layout.
 * - `draggable`: HTML drag flag, set to `false` on the canvas image.
 *
 * Custom renderers MUST forward `ref` to the underlying `<img>` element so the
 * canvas resize-to-proportion logic can read `naturalWidth` / `naturalHeight`.
 */
export interface ImageRendererProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    draggable?: boolean;
}

/**
 * Component type for rendering images inside the editor.
 *
 * Implementations must accept a forwarded ref pointing at the rendered
 * `HTMLImageElement` — the editor reads natural dimensions off the ref.
 */
export type ImageRenderer = ComponentType<ImageRendererProps & { ref?: Ref<HTMLImageElement> }>;

/**
 * Default image renderer: a plain `<img>` with the ref forwarded through.
 *
 * Section images in the editor are base64 data URLs, so framework-level
 * optimization (e.g. `next/image`) would always be bypassed anyway. The plain
 * element is functionally equivalent and removes the Next.js coupling.
 */
export const defaultImageRenderer: ImageRenderer = forwardRef<HTMLImageElement, ImageRendererProps>(
    function DefaultImageRenderer({ src, alt, className, draggable }, ref) {
        // `fill` is intentionally dropped; parent layout already sizes the image.
        // Section images are base64 data URLs, so `next/image` optimization is a no-op here.
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                ref={ref}
                src={src}
                alt={alt}
                className={className}
                draggable={draggable}
            />
        );
    },
);

/**
 * Configuration consumed by the editor at render time.
 */
export interface EditorConfig {
    /** Component used to render section and thumbnail images. */
    imageRenderer: ImageRenderer;
}

const defaultConfig: EditorConfig = {
    imageRenderer: defaultImageRenderer,
};

/**
 * Context carrying the active {@link EditorConfig}.
 *
 * Defaults to {@link defaultConfig} so {@link useEditorConfig} never throws,
 * even when invoked outside a provider (useful for tests and Storybook).
 */
export const EditorConfigContext = createContext<EditorConfig>(defaultConfig);

/**
 * Hook returning the active editor configuration.
 */
export function useEditorConfig(): EditorConfig {
    return useContext(EditorConfigContext);
}

/**
 * Provider that merges partial overrides with the defaults.
 *
 * Useful for embedders who only want to override a single field (e.g. swap
 * `imageRenderer` for a `next/image` wrapper) without re-specifying the rest.
 */
export function EditorConfigProvider({
    value,
    children,
}: {
    value?: Partial<EditorConfig>;
    children: ReactNode;
}) {
    const merged: EditorConfig = {
        ...defaultConfig,
        ...value,
    };
    return <EditorConfigContext.Provider value={merged}>{children}</EditorConfigContext.Provider>;
}
