# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Bun is the package manager and runtime (see global CLAUDE.md). All scripts come from [package.json](package.json):

- `bun dev` — Next.js dev server on **port 4000** (not 3000; README is out of date).
- `bun run build` — production build (also run by the `pre-push` Husky hook).
- `bun start` — serve the production build.
- `bun lint` — `next lint` (ESLint flat config in [eslint.config.mjs](eslint.config.mjs)).
- `bun typecheck` — `tsc --noEmit`. Run alongside lint; both gate commits via `pre-commit`.

No test runner is wired up in `package.json`. [bunfig.toml](bunfig.toml) preloads `src/test/setup.ts` and [tsconfig.json](tsconfig.json) excludes `src/test/**`, but that directory does not currently exist — don't claim "tests pass" without first creating the harness. README/CONTRIBUTING references to tests are aspirational.

Husky hooks (`.husky/`):
- `pre-commit` → `bun typecheck` + `bun lint`
- `commit-msg` → commitlint with `@commitlint/config-conventional`
- `pre-push` → `bun run build`

## Architecture

DocMosaic is a **fully client-side** PDF builder. Users drop images into rectangular "sections" on a virtual page; the entire document model lives in React state and is rendered to a PDF in the browser via `jspdf`. No backend, no uploads — privacy is a product promise, not a side effect.

### Routing (Next.js 15 App Router)

- [src/app/page.tsx](src/app/page.tsx) — marketing landing page composed of `components/blocks/*`.
- [src/app/pdf-editor/page.tsx](src/app/pdf-editor/page.tsx) — the editor route. Sets metadata + JSON-LD and renders `<PDFEditor />` inside `<Suspense>`.
- [src/app/editor/](src/app/editor) — exists but is **empty**; no route. Don't add code here without checking whether it's intentional.
- [src/app/layout.tsx](src/app/layout.tsx) — global head, Montserrat font (`--font-montserrat`), GTM + GA + Vercel Analytics, and shared `Header`.

### Editor state — single hook owns the document

[src/lib/pdf-editor/hooks/useDocumentState.ts](src/lib/pdf-editor/hooks/useDocumentState.ts) is the single source of truth for the `PDFDocument`. It exposes `{ document, formattedDate, canUndo, canRedo, actions }`. **Undo/redo is implemented via a `history: PDFDocument[]` array** — every mutating action calls `addToHistory` with the new snapshot. If you add a new mutator, route it through `updateDocument()` (or call `addToHistory` explicitly) or the timeline will desync.

The top-level [src/components/pdf-editor/index.tsx](src/components/pdf-editor/index.tsx) (`PDFEditor`) consumes that hook and wires `Header`, `Toolbar`, `Sidebar`, `Canvas`, and `Preview`. There is **one** `<DndProvider backend={HTML5Backend}>` here — don't nest another.

### PDF generation pipeline

[src/lib/pdf.ts](src/lib/pdf.ts) (`generatePDF`) is the only path that produces a PDF. Flow:
1. Optimize background PDFs and section images via `processImagesForPDF` ([src/lib/pdf-editor/utils/image.ts](src/lib/pdf-editor/utils/image.ts)) with progress reporting split 30%/70% across the "optimizing" stage.
2. Create a `jsPDF` doc in **points (72 DPI)** using `CUSTOM_PAGE_SIZES[pageSize]`.
3. For each `Page`, draw background then per-page sections.
4. Track stats via `trackEvent.documentGenerated`.

Cancellation: `PDFEditor` keeps an `AbortController` in a ref; the `signal` is checked at every awaitable step in `generatePDF`. Throwing `Error('PDF generation cancelled')` is the expected control-flow path — preserve it if refactoring.

`estimatePDFSize` (also in `pdf.ts`) is reused live in the toolbar to show projected file size and runs from a `useEffect` on `document.sections`/`document.pages`.

### Coordinates and units

All section geometry (`x`, `y`, `width`, `height`) is stored in **PDF points (72 DPI)**, not CSS pixels. `createNewImageSection` ([src/lib/pdf-editor/utils/document.ts](src/lib/pdf-editor/utils/document.ts)) converts the px input via `px * 72/96` before persisting. The canvas applies its own `scale`/`zoom` for display. If you compute geometry, stay in points or convert explicitly — mixing is the #1 source of subtle layout bugs here.

### Type duplication (intentional friction point)

There are **two parallel domain-type files**:

- [src/lib/pdf-editor/types/index.ts](src/lib/pdf-editor/types/index.ts) — uses `ImageSection`. Imported by everything under `src/lib/pdf-editor/**` and `src/components/pdf-editor/**`.
- [src/lib/types.ts](src/lib/types.ts) — uses `Section` (same shape, different name) plus `PDFGenerationOptions`, `DragPosition`, `ResizeInfo`. Imported by [src/lib/pdf.ts](src/lib/pdf.ts) and [src/lib/analytics.ts](src/lib/analytics.ts).

The shapes are structurally compatible so TypeScript lets them flow into each other, but **when editing one, check whether the other needs the same change**. Don't unify them in passing — that's a real refactor with cross-file blast radius.

`CUSTOM_PAGE_SIZES` is also duplicated between [src/lib/pdf.ts](src/lib/pdf.ts) and [src/lib/pdf-editor/utils/page-sizes.ts](src/lib/pdf-editor/utils/page-sizes.ts). Same caveat.

### Mobile

`isMobile()` from [src/lib/mobile/detection.ts](src/lib/mobile/detection.ts) gates a parallel UX path (haptics + custom gesture manager in [src/lib/mobile/gestures.ts](src/lib/mobile/gestures.ts), pinch/swipe/long-press on the canvas, a `<Sheet>`-based sidebar). Always guard with `typeof window !== 'undefined' && isMobile()` before calling haptics — the editor is rendered inside `<Suspense>` but components run on the client.

### Design tokens

[src/lib/pdf-editor/constants/theme.ts](src/lib/pdf-editor/constants/theme.ts) defines the `DOCMOSAIC_COLORS` palette (`cream`, `caramel`, `orange`, `purple`, `sage`, `white`, `black`). [tailwind.config.ts](tailwind.config.ts) imports this directly and exposes it under `docmosaic.*` (e.g. `text-docmosaic-orange`, `bg-docmosaic-cream`). **Use these tokens, not raw hex values** — that's how the brand palette stays in sync between code and Tailwind classes.

Shadcn primitives live under `src/components/ui/{core,form,data-display,navigation}/` — reuse before adding new ones.

### Analytics

[src/lib/analytics.ts](src/lib/analytics.ts) exposes a `trackEvent` namespace wrapping Vercel `track()`. Calls **only fire when `NODE_ENV === 'production'`**, so local dev/staging never produces events — don't chase "missing events" in dev.

### Path alias

`@/*` → `./src/*` (see [tsconfig.json](tsconfig.json)). Prefer this over relative climbs.

## Conventions specific to this repo

- Prettier config (4-space indent, single quotes, semicolons, 100-col, trailing commas) is enforced — match it. ESLint disables `jsx-a11y/alt-text` only for `src/components/pdf-editor/PDFDocument.tsx`.
- Commit messages use Conventional Commits and are validated by commitlint. Recent log uses bare types (`refactor:`, not `refactor(header):`) — match that style.
- The dev server port is **4000**. Any docs/scripts that say "localhost:3000" are stale.
