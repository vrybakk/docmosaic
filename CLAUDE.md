# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Bun workspaces monorepo. Three workspaces:

- [apps/web/](apps/web) — `@docmosaic/web`, the Next.js 15 app at [docmosaic.com](https://docmosaic.com). Hosts the marketing landing page and the `/pdf-editor` route. Imports `@docmosaic/core` + `@docmosaic/react` and provides the analytics tracker.
- [packages/core/](packages/core) — `@docmosaic/core`, framework-agnostic document model, reducer + history, page-size math, and the `jspdf`-based PDF generation pipeline. No React.
- [packages/react/](packages/react) — `@docmosaic/react`, compound `<Editor.*>` primitives plus the headless `useDocumentState` hook. Depends on `@docmosaic/core` as a peer.

Root holds only repo-wide concerns: Husky hooks, commitlint, Prettier, Turborepo pipeline, and the workspace `package.json`.

## Commands

Bun is the package manager and runtime (see global CLAUDE.md). Scripts run via Turborepo from the repo root:

- `bun dev` — runs `dev` in every workspace. `apps/web` serves on **port 4001** (`next dev -p 4001`).
- `bun run build` — builds all three packages. `packages/core` + `packages/react` use `tsup`; `apps/web` uses `next build`. Also run by the `pre-push` Husky hook.
- `bun run typecheck` — `tsc --noEmit` in every workspace.
- `bun run lint` — ESLint in every workspace (`next lint` in apps/web; flat-config ESLint in core + react).
- `bun run test` / `bun run test:run` — Vitest across all workspaces. Test files: 27 in core, 29 in react, 2 in apps/web (58 total). The PDF byte-diff guard lives at [packages/core/src/pdf/generate.test.ts](packages/core/src/pdf/generate.test.ts) — keep it green on every change to the generation pipeline.

Husky hooks (`.husky/`):

- `pre-commit` → `bun run typecheck` + `bun run lint`
- `commit-msg` → commitlint with `@commitlint/config-conventional`
- `pre-push` → `bun run build`

Per-workspace `bunfig.toml`/test setup:

- [bunfig.toml](bunfig.toml) at the root pins `linker = "hoisted"` so tools like `next lint` (spawned from inside `apps/web/`) can resolve their plugin chains.
- Vitest configs live next to each workspace's `package.json`. `apps/web` preloads [apps/web/src/test/setup.ts](apps/web/src/test/setup.ts); `packages/react` preloads [packages/react/src/test-setup.ts](packages/react/src/test-setup.ts); `packages/core` runs in `node` env with no setup.

## Architecture

DocMosaic is a **fully client-side** PDF builder. Users drop images into rectangular "sections" on a virtual page; the entire document model lives in React state and is rendered to a PDF in the browser via `jspdf`. No backend, no uploads — privacy is a product promise, not a side effect.

### `apps/web` — the Next.js shell

- [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx) — marketing landing page composed of `components/blocks/*`.
- [apps/web/src/app/pdf-editor/page.tsx](apps/web/src/app/pdf-editor/page.tsx) — the editor route. Sets metadata + JSON-LD, then renders `<EditorMount />` inside `<Suspense>`.
- [apps/web/src/app/pdf-editor/editor-mount.tsx](apps/web/src/app/pdf-editor/editor-mount.tsx) — client boundary that composes the `<Editor.*>` namespace exported from `@docmosaic/react`. Next.js client-reference proxies don't support property access from a Server Component, so the namespace is dereferenced here.
- [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx) — global head, Montserrat font (`--font-montserrat`), GTM + GA + Vercel Analytics, shared `Header`, and the `AnalyticsBridge` that wires the analytics tracker into the React package.
- [apps/web/src/lib/analytics.ts](apps/web/src/lib/analytics.ts) — `trackEvent` namespace with an injectable tracker. Calls **only forward to the tracker when `NODE_ENV === 'production'`**, so local dev/staging never produces events. The bridge in [apps/web/src/app/analytics-bridge.tsx](apps/web/src/app/analytics-bridge.tsx) calls `setReactPackageTracker` so the React package can fire its own events through the same pipe.

### `@docmosaic/core` — document model + PDF generation

- [packages/core/src/types.ts](packages/core/src/types.ts) — the single source of truth for `Document`, `Page`, `Section`, `PageSize`, `PageOrientation`, `MeasurementUnit`, `DragPosition`, `ResizeInfo`, `PDFGenerationOptions`. Used by both packages and `apps/web`.
- [packages/core/src/reducer.ts](packages/core/src/reducer.ts) — the document reducer. All mutations flow through it.
- [packages/core/src/history.ts](packages/core/src/history.ts) — `withHistory` wraps the reducer with undo/redo via a snapshot timeline. If you add a new mutator, route it through `reducer` + `withHistory`, or the timeline will desync.
- [packages/core/src/page-sizes.ts](packages/core/src/page-sizes.ts) — `CUSTOM_PAGE_SIZES` (points/72 DPI) and orientation-aware dimensions. This file is the **single** source — there is no longer a duplicate in `apps/web`.
- [packages/core/src/factories.ts](packages/core/src/factories.ts) — `createDocument`, `createPage`, `createSection`. Sections persist geometry in **points**, not pixels.
- [packages/core/src/pdf/generate.ts](packages/core/src/pdf/generate.ts) (`generatePDF`) — the only path that produces a PDF. Flow:
  1. Optimize background PDFs and section images via `processImagesForPDF` ([packages/core/src/pdf/optimize-image.ts](packages/core/src/pdf/optimize-image.ts)) with progress reporting split 30%/70% across the "optimizing" stage.
  2. Create a `jsPDF` doc in **points (72 DPI)** using `CUSTOM_PAGE_SIZES[pageSize]`.
  3. For each `Page`, draw background then per-page sections.
- Cancellation: callers pass an `AbortSignal`; the signal is checked at every awaitable step in `generatePDF`. Throwing `Error('PDF generation cancelled')` is the expected control-flow path — preserve it if refactoring.
- [packages/core/src/pdf/estimate.ts](packages/core/src/pdf/estimate.ts) (`estimatePDFSize`) feeds the live "estimated size" pill in the toolbar.
- [packages/core/src/pdf/generate.test.ts](packages/core/src/pdf/generate.test.ts) — **byte-diff guard**. Generates a PDF from a fixed fixture and compares the bytes to a checked-in snapshot. Treat any change here as load-bearing: if the bytes shift, the cause is either intentional (update the snapshot deliberately) or a regression in the generation pipeline.

### `@docmosaic/react` — UI primitives + headless hook

- [packages/react/src/index.ts](packages/react/src/index.ts) — public surface. Exports `Editor.*` compound namespace, `useDocumentState`, `useEditor`/`useEditorSection`/`useEditorCanvas`, `EditorConfigProvider`, `usePdfGeneration`, `setReactPackageTracker`, plus the supporting types.
- [packages/react/src/primitives/editor-root.tsx](packages/react/src/primitives/editor-root.tsx) — `Editor.Root` orchestrator. Owns controlled/uncontrolled document state and provides the `<DndProvider backend={HTML5Backend}>` plus the editor + config contexts. There is exactly **one** DnD provider — don't nest another.
- [packages/react/src/hooks/use-document-state.ts](packages/react/src/hooks/use-document-state.ts) — headless ("BYO-UI") state hook. Returns `{ document, formattedDate, canUndo, canRedo, actions }`. Built on top of `reducer` + `withHistory` from `@docmosaic/core`. Every mutator dispatches an action; the timeline lives inside the hook.
- [packages/react/src/context/editor.tsx](packages/react/src/context/editor.tsx) — the `EditorProvider` + `useEditor` etc. that compound primitives read from. If you add a new primitive, consume the context here rather than prop-drilling.
- [packages/react/src/context/editor-config.tsx](packages/react/src/context/editor-config.tsx) — `EditorConfigProvider` + `ImageRenderer` injection point. `apps/web` swaps in `next/image` here at mount time.
- [packages/react/src/primitives/canvas/](packages/react/src/primitives/canvas) — interactive workspace, including `use-canvas-zoom` and `canvas-controls`.
- [packages/react/src/primitives/image-section/](packages/react/src/primitives/image-section) — section drag/resize/upload primitives.
- [packages/react/src/primitives/toolbar/](packages/react/src/primitives/toolbar) — toolbar buttons + estimated size + progress overlay.
- [packages/react/src/primitives/header/](packages/react/src/primitives/header) — top-bar primitives (`PageSizeSelect`, `OrientationSelect`, `DocumentName`).
- [packages/react/src/primitives/use-pdf-generation.ts](packages/react/src/primitives/use-pdf-generation.ts) — `usePdfGeneration` hook wrapping `generatePDF` with an `AbortController` for cancellation.
- [packages/react/src/internal/options.ts](packages/react/src/internal/options.ts) — `PAGE_SIZE_OPTIONS` + `ORIENTATION_OPTIONS` consumed by the header selects.
- [packages/react/src/internal/analytics.ts](packages/react/src/internal/analytics.ts) — `setReactPackageTracker` + `AnalyticsTracker` type. The package never imports `apps/web` directly; the host app injects a tracker at boot.

### Coordinates and units

All section geometry (`x`, `y`, `width`, `height`) is stored in **PDF points (72 DPI)**, not CSS pixels. `createSection` ([packages/core/src/factories.ts](packages/core/src/factories.ts)) converts the px input via `px * 72/96` before persisting. The canvas applies its own `scale`/`zoom` for display. If you compute geometry, stay in points or convert explicitly — mixing is the #1 source of subtle layout bugs here.

### Design tokens

[apps/web/src/lib/pdf-editor/constants/theme.ts](apps/web/src/lib/pdf-editor/constants/theme.ts) defines the `DOCMOSAIC_COLORS` palette (`cream`, `caramel`, `orange`, `purple`, `sage`, `white`, `black`). [apps/web/tailwind.config.ts](apps/web/tailwind.config.ts) imports this directly and exposes it under `docmosaic.*` (e.g. `text-docmosaic-orange`, `bg-docmosaic-cream`). The Tailwind `content` glob also scans `../../packages/react/src/**/*.{ts,tsx}` so primitive classes get included in the app build. **Use these tokens, not raw hex values** — that's how the brand palette stays in sync between code and Tailwind classes.

Shadcn primitives live under `apps/web/src/components/ui/{core,form,data-display,navigation}/` — reuse before adding new ones.

### Path alias

`@/*` → `./src/*` in `apps/web` (see [apps/web/tsconfig.json](apps/web/tsconfig.json)). Prefer this over relative climbs inside the app. The packages don't use a path alias — they ship as published artifacts and use relative imports internally.

## Conventions specific to this repo

- Prettier config (4-space indent, single quotes, semicolons, 100-col, trailing commas) is enforced — match it.
- Commit messages use Conventional Commits and are validated by commitlint. Recent log uses bare types (`refactor:`, not `refactor(header):`) — match that style. Subject only; no body unless the change really needs context.
- The dev server port is **4001**. Any docs/scripts that say "localhost:3000" or "localhost:4000" are stale.
- ESLint runs separately per workspace; rules don't bleed between them. Touch the package-specific `eslint.config.mjs` (or `apps/web/eslint.config.mjs`) when you need a rule change.
- Publish hygiene: `bunx --bun publint <package>` and `bunx --bun -p @arethetypeswrong/cli attw --pack .` should stay clean for both published packages before bumping a release.
