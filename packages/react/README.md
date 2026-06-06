# @docmosaic/react

React UI primitives for the DocMosaic editor — a fully client-side, drag-and-drop PDF builder that lets users arrange images into rectangular sections on a virtual page and export the result as a PDF in the browser. The package ships a compound `Editor.*` namespace plus headless hooks that wrap [`@docmosaic/core`](../core/README.md), so you can drop in the default shell or assemble your own UI on top of the same state machine.

See [`apps/web/public/showcases/hero.png`](../../apps/web/public/showcases/hero.png) for a screenshot of the default shell in the reference app.

## Install

```bash
bun add @docmosaic/react @docmosaic/core react-dom
```

Peer dependencies:

-   `react@^19`
-   `react-dom@^19`
-   `@docmosaic/core` (workspace peer)

## Minimal example

```tsx
import { Editor } from '@docmosaic/react';
import '@docmosaic/react/styles.css';

export function MyEditor() {
    return (
        <Editor.Root>
            <Editor.Header />
            <Editor.Toolbar />
            <Editor.PageList />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
            <Editor.Preview />
        </Editor.Root>
    );
}
```

`Editor.Root` owns document state (reducer + history) internally in uncontrolled mode. The CSS import seeds the `--editor-*` theming tokens.

## Controlled mode

Pass `document` + `onDocumentChange` to drive state from outside. Undo/redo are disabled in controlled mode because the timeline lives outside the editor.

```tsx
import { createDocument } from '@docmosaic/core';

const [doc, setDoc] = useState(createDocument());

<Editor.Root document={doc} onDocumentChange={setDoc}>
    {/* same children as above */}
</Editor.Root>;
```

## Custom PDF backend

Swap the bundled `jspdf` pipeline for your own — e.g. a Worker, `pdf-lib`, or a server endpoint. Either `generate` or `estimate` (or both) can be overridden.

```tsx
import type { generatePDF, estimatePDFSize } from '@docmosaic/core';

const generate: typeof generatePDF = async (sections, options, onProgress) =>
    myCustomRenderer(sections, options, onProgress);

const estimate: typeof estimatePDFSize = (sections, backgrounds) =>
    mySizeHeuristic(sections, backgrounds);

<Editor.Root pdf={{ generate, estimate }}>{/* … */}</Editor.Root>;
```

## Custom image renderer

By default, section images render via a plain `<img>`. Override via `EditorConfigProvider` to wire `next/image`, a CDN loader, or anything else. Renderers must forward `ref` to the underlying `HTMLImageElement` — the canvas reads `naturalWidth` / `naturalHeight` off it.

```tsx
import { EditorConfigProvider } from '@docmosaic/react';
import Image from 'next/image';

<EditorConfigProvider value={{ imageRenderer: NextImageAdapter }}>
    <Editor.Root>{/* … */}</Editor.Root>
</EditorConfigProvider>;
```

## Theming

The editor reads CSS custom properties for every accent color, radius, and shadow. Override the tokens defined in `styles.css` to retheme without forking components.

```css
:root {
    --editor-color-accent: 30 41 59; /* slate-800 */
    --editor-radius-section: 8px;
}
```

The full token list lives in [`src/styles.css`](src/styles.css).

## Analytics callback

`@docmosaic/react` ships a no-op analytics tracker. Install your provider once at boot — Vercel `track`, PostHog `capture`, anything matching the `(event, payload)` signature. Events fire only when `process.env.NODE_ENV === 'production'`.

```ts
import { setReactPackageTracker } from '@docmosaic/react';
import { track } from '@vercel/analytics';

setReactPackageTracker((event, payload) => track(event, payload));
```

## Headless API

Reach past the compound primitives to drive your own UI from the same reducer + history timeline:

```tsx
import { createDocument } from '@docmosaic/core';
import { useDocumentState } from '@docmosaic/react';

const { document, canUndo, canRedo, actions } = useDocumentState({
    initialDocument: createDocument(),
});
```

`actions` is a stable 14-method surface (`undo`, `redo`, `addSection`, `updateSection`, `deleteSection`, `duplicateSection`, `addPage`, `deletePage`, `changePage`, `updatePageSize`, `updateOrientation`, `updateName`, `reorderPages`, `updateEstimatedSize`). See the [JSDoc on `useDocumentState`](src/hooks/use-document-state.ts) for parameter details.

## Full API reference

Every export is documented inline with JSDoc; the generated declarations land at `dist/index.d.ts` after `bun run build`. The public surface is:

-   `Editor` namespace — `Root`, `Header`, `Toolbar`, `PageList`, `Canvas`, `Section`, `Preview`, and their child buttons/selects.
-   Hooks — `useDocumentState`, `useEditor`, `useEditorCanvas`, `useEditorSection`, `usePdfGeneration`.
-   Providers — `EditorProvider`, `EditorConfigProvider`, `EditorConfigContext`.
-   Helpers — `defaultImageRenderer`, `setReactPackageTracker`, `EditorLayout`.
-   Types — `EditorRootProps`, `EditorActions`, `EditorContextValue`, `EditorPdfApi`, `EditorPdfBackend`, `EditorUiState`, `EditorConfig`, `ImageRenderer`, `ImageRendererProps`, `GenerationState`, `AnalyticsTracker`, `UseEditorSectionResult`.

## Compatibility

-   React 19+ (peer-pinned).
-   Tested with Next.js 15 (App Router) — see [`apps/web`](../../apps/web) for the reference integration, including the `'use client'` boundary required to mount `Editor.Root` from a Server Component.

## License

MIT.
