'use client';

import { Canvas, type CanvasProps } from './index';

/**
 * Read-only canvas primitive. Convenience alias that forces the wrapped
 * {@link Canvas} into read-only mode regardless of the surrounding
 * `Editor.Root`'s `readOnly` prop — drag, resize, drop, file upload, and
 * section toolbars are all suppressed.
 *
 * The folding rule is `effectiveReadOnly = root.readOnly || canvas.readOnly`,
 * so `StaticCanvas` is enough on its own when you want a viewer surface
 * inside an otherwise editable root (e.g. a "compare side-by-side" view that
 * pairs an editable canvas with a frozen reference).
 *
 * Selection (click, marquee), zoom, pan, and the preview/print/download
 * pipeline all remain live — read-only is about mutation, not navigation.
 *
 * @example Viewer-only canvas inside an editable root
 * ```tsx
 * <Editor.Root defaultDocument={doc}>
 *   <Editor.Toolbar />
 *   <Editor.StaticCanvas>
 *     <Editor.Section />
 *   </Editor.StaticCanvas>
 * </Editor.Root>
 * ```
 *
 * @example Full read-only viewer
 * ```tsx
 * <Editor.Root defaultDocument={signedContract} readOnly>
 *   <Editor.Properties />
 *   <Editor.StaticCanvas />
 *   <Editor.Preview />
 * </Editor.Root>
 * ```
 */
export function StaticCanvas(props: Omit<CanvasProps, 'readOnly'> = {}) {
    return <Canvas {...props} readOnly />;
}
