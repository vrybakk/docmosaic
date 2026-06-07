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

The editor reads CSS custom properties for every accent color, radius, and shadow. The stylesheet ships in two layers so you can keep the structural defaults and swap only the brand colors:

-   `styles/base.css` — brand-agnostic structural tokens (`--editor-radius-section`, `--editor-shadow-section`).
-   `styles/themes/docmosaic.css` — the DocMosaic brand colors (`--editor-color-*` triplets).
-   `styles.css` — convenience bundle that imports both.

### Default DocMosaic look

```ts
import '@docmosaic/react/styles.css';
```

### Custom theme on the shared base

Supply your own `--editor-color-*` values in a stylesheet next to your app code, then import the base first so structural defaults come along:

```ts
import '@docmosaic/react/styles/base.css';
import './my-theme.css';
```

```css
/* my-theme.css */
:root {
    --editor-color-accent: 30 41 59; /* slate-800 */
    --editor-color-accent-soft: 226 232 240; /* slate-200 */
    --editor-color-success: 34 197 94; /* green-500 */
    --editor-color-warning: 234 88 12; /* orange-600 */
    --editor-color-warning-soft: 251 191 36; /* amber-400 */
    --editor-color-surface: 255 255 255;
    --editor-color-text: 15 23 42; /* slate-900 */
}
```

### Explicit DocMosaic theme on the base

Same as `styles.css` but spelled out — useful when you want to layer the brand theme conditionally:

```ts
import '@docmosaic/react/styles/base.css';
import '@docmosaic/react/styles/themes/docmosaic.css';
```

### Token reference

Color tokens (RGB triplets — space-separated for `rgb(R G B / <alpha-value>)`):

| Token                        | Purpose                                                       | DocMosaic value      |
| ---------------------------- | ------------------------------------------------------------- | -------------------- |
| `--editor-color-accent`      | Primary accent — buttons, active section borders, focus rings | `56 29 42` (#381D2A) |
| `--editor-color-accent-soft` | Soft accent — hover states, subtle highlights                 | `252 222 156`        |
| `--editor-color-success`     | Success state — confirmation, completed steps                 | `196 214 176`        |
| `--editor-color-warning`     | Warning — destructive actions, alerts                         | `186 86 36`          |
| `--editor-color-warning-soft`| Soft warning — caution badges, partial states                 | `255 165 82`         |
| `--editor-color-surface`     | Editor background surface                                     | `255 255 255`        |
| `--editor-color-text`        | Default editor text color                                     | `56 29 42`           |

Structural tokens:

| Token                     | Purpose                          | Default                       |
| ------------------------- | -------------------------------- | ----------------------------- |
| `--editor-radius-section` | Border radius for image sections | `4px`                         |
| `--editor-shadow-section` | Shadow for image sections        | `0 1px 3px rgba(0, 0, 0, 0.1)`|

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
