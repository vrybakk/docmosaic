# DocMosaic

DocMosaic is an open-source, fully client-side PDF builder. Users drop images into rectangular sections on a virtual page; the whole document model lives in React state and renders to a PDF in the browser via `jspdf`. No backend, no uploads — privacy is a product promise, not a side effect.

This repository is the monorepo. It contains the reusable libraries plus the reference Next.js app that runs at [docmosaic.com](https://docmosaic.com).

## What's in here

| Package                                  | Description                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| [`@docmosaic/core`](packages/core)       | Framework-agnostic TypeScript core: document model, reducer + history, PDF engine. |
| [`@docmosaic/react`](packages/react)     | React UI primitives: compound `Editor.*` namespace plus headless hooks.            |
| [`@docmosaic/web`](apps/web) _(private)_ | Reference Next.js 15 app — the site at docmosaic.com.                              |

## Architecture

```text
apps/web (Next.js 15)
    │
    ▼
@docmosaic/react   ──  compound primitives + hooks
    │
    ▼
@docmosaic/core    ──  pure types, reducer, PDF engine
```

`apps/web` is a thin layer: a marketing landing page, the `/pdf-editor` route that mounts `Editor.Root`, and the analytics bridge that wires Vercel `track` into both the app and `@docmosaic/react`. Everything interactive lives in the packages.

## Features

-   Drag-and-drop image arrangement on a virtual page
-   Multi-page documents with reorderable pages
-   Per-page PDF backgrounds
-   Live PDF size estimate
-   Undo/redo with a history timeline
-   All A-series, US Letter/Legal, plus portrait/landscape orientations
-   Mobile gesture support (pinch, swipe, long-press) in the reference app
-   Privacy-first: everything runs in the browser

## Develop locally

```bash
bun install
bun run dev
```

The reference app boots at <http://localhost:4001>. The editor itself is at `/pdf-editor`.

Other Turborepo tasks:

```bash
bun run build       # build every package + the web app
bun run typecheck   # tsc --noEmit across the workspace
bun run lint        # ESLint where configured
bun run test:run    # vitest run in CI mode
```

After a manual change, walk through [`docs/SMOKE.md`](docs/SMOKE.md) — a 90-second checklist that catches the regressions our automated tests can't.

## Repo conventions

-   **Bun** as package manager and runtime (`packageManager: "bun@1.3.11"`).
-   **Turborepo** for task orchestration (`turbo.json`) with caching.
-   **Changesets** for versioning the public packages — `@docmosaic/web` is in the ignore list because it never ships to npm.
-   **Conventional Commits**, enforced by commitlint via Husky.
-   Husky hooks: `pre-commit` runs typecheck + lint, `pre-push` runs the full build.

## Documentation

Conceptual walk-throughs of how the editor is put together live in [`docs/concepts/`](docs/concepts):

-   [Designer](docs/concepts/designer.md) — the `Editor.Root` composition and selection model
-   [Theming](docs/concepts/theming.md) — the `--editor-*` CSS-variable surface
-   [Unit system](docs/concepts/unit-system.md) — why geometry lives in PDF points
-   [Keybindings](docs/concepts/keybindings.md) — default keymap and overrides
-   [Layers](docs/concepts/layers.md) — `zIndex` model and reorder actions

Per-package API references live in [`packages/core/README.md`](packages/core/README.md) and [`packages/react/README.md`](packages/react/README.md). The manual smoke checklist is [`docs/SMOKE.md`](docs/SMOKE.md).

## Contributing

We welcome bug fixes, new features, and documentation improvements. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, commit conventions, and Changeset instructions.

## License

MIT — see [LICENSE](LICENSE).

## Links

-   [Production](https://docmosaic.com)
-   [Live demo](https://docmosaic.vercel.app)
-   [Issue tracker](https://github.com/vrybakk/doc-mosaic/issues)
