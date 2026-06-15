# @docmosaic/react

React UI primitives for the DocMosaic editor — a fully client-side, drag-and-drop PDF builder. The package ships a compound `Editor.*` namespace plus headless hooks that wrap [`@docmosaic/core`](../core/README.md), so you can drop in the default shell or assemble your own UI on top of the same state machine.

**Full documentation:** [docs.docmosaic.com](https://docs.docmosaic.com)

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
            <Editor.Properties />
            <Editor.Toolbar />
            <Editor.Pages />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
            <Editor.Preview />
        </Editor.Root>
    );
}
```

`Editor.Root` owns document state (reducer + history) internally in uncontrolled mode. The CSS import seeds the `--editor-*` theming tokens.

## What's where

The canonical reference lives at [docs.docmosaic.com](https://docs.docmosaic.com):

-   **[Get started](https://docs.docmosaic.com/docs/get-started/introduction)** — installation, quick start, controlled vs uncontrolled
-   **[Concepts](https://docs.docmosaic.com/docs/concepts/designer)** — designer mental model, document model, history, unit system, layers, keybindings
-   **[Primitives](https://docs.docmosaic.com/docs/primitives/root)** — every `Editor.*` primitive with a live preview, prop table, and examples
-   **[Recipes](https://docs.docmosaic.com/docs/recipes/custom-pdf-backend)** — custom PDF backend, custom image renderer, persisting templates, BYO-UI, modal embedding, server-component boundary, analytics wiring, dark mode
-   **[Reference](https://docs.docmosaic.com/docs/reference/hooks)** — hooks, actions, types, config
-   **[Theming](https://docs.docmosaic.com/docs/theming)** — token surface, dark mode, brand swap
-   **[Storybook](https://storybook.docmosaic.com)** — live sandbox with 100+ stories

## License

MIT — see [LICENSE](../../LICENSE).
