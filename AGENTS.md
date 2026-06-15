# AGENTS.md

Single source of truth for anyone — human contributor or AI assistant — working in this repo. The tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.windsurf/rules/`) all defer here. For the contribution workflow (branches, PRs, the gate), see [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

DocMosaic is an open-source, **fully client-side** PDF builder. Users drop images into rectangular "sections" on a virtual page; the entire document model lives in React state and renders to a PDF in the browser via `jspdf`. No backend, no uploads — privacy is a product promise, not a side effect.

It ships as two npm packages plus a reference app:

-   **[@docmosaic/core](https://www.npmjs.com/package/@docmosaic/core)** + **[@docmosaic/react](https://www.npmjs.com/package/@docmosaic/react)** — the reusable libraries.
-   The marketing site + editor at [docmosaic.com](https://docmosaic.com); docs at [docs.docmosaic.com](https://docs.docmosaic.com).

## Quick start

Bun is the package manager **and** runtime — not npm.

```bash
bun install
bun dev            # runs dev in every workspace; apps/web serves on http://localhost:4001
bun run build      # build all workspaces (Turborepo)
bun run typecheck  # tsc --noEmit everywhere
bun run lint       # ESLint everywhere
bun run test:run   # Vitest everywhere
```

Everything is orchestrated by **Turborepo** from the repo root.

## Repo layout — where things live

Bun workspaces monorepo, **5 workspaces**:

| Path             | Package                | What it is                                                                                                    |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `apps/web`       | `@docmosaic/web`       | Next.js 15 app — the marketing landing page + the `/pdf-editor` route. The **deployable** site (port 4001).   |
| `apps/docs`      | `@docmosaic/docs`      | Fumadocs documentation site (docs.docmosaic.com).                                                             |
| `apps/storybook` | `@docmosaic/storybook` | Component stories for the React primitives.                                                                   |
| `packages/core`  | `@docmosaic/core`      | Framework-agnostic document model, reducer + history, page-size math, and the `jspdf` PDF pipeline. No React. |
| `packages/react` | `@docmosaic/react`     | Compound `<Editor.*>` primitives + the headless `useDocumentState` hook. Depends on `@docmosaic/core`.        |

The root holds repo-wide concerns only: Husky hooks, commitlint, Prettier, Turborepo, Changesets, and the workspace `package.json`.

## Architecture (the short version)

**`@docmosaic/core`** — pure logic, no React:

-   `src/types.ts` — the single source of truth for `Document`, `Page`, `Section` (the `image` / `text` / `shape` / `drawing` / `frame` variants), `PageSize`, `PageOrientation`, geometry types.
-   `src/reducer.ts` — **all** document mutations flow through this reducer.
-   `src/history.ts` — `withHistory` wraps the reducer with undo/redo. New mutators must route through `reducer` + `withHistory` or the timeline desyncs.
-   `src/frames.ts` — container-frame helpers; `orderSectionsForRender` is the **single source of render order**, shared by the canvas, PDF, and PNG so all three layer identically.
-   `src/pdf/generate.ts` — `generatePDF`, the **only** path that produces a PDF (points / 72 DPI via `jspdf`).
-   `src/pdf/generate.test.ts` — the **byte-diff guard** (see Testing). Load-bearing.
-   `src/templates.ts` — `exportTemplate` / `importTemplate` (stable-ordered JSON serialization).

**`@docmosaic/react`** — UI primitives + headless hook:

-   `src/index.ts` — the public surface (`Editor.*` namespace, `useDocumentState`, hooks, providers, types).
-   `src/primitives/editor-root.tsx` — `Editor.Root`: owns state, mounts the **single** `<DndProvider>`, provides contexts. `<Editor.Root />` with no children renders the full responsive app-shell.
-   `src/primitives/app-shell/` — the resizable desktop shell + the touch-first mobile shell (below 1024px).
-   `src/primitives/canvas/`, `section/`, `toolbar/`, `pages/` — the interactive primitives.

**`apps/web`** — `src/app/page.tsx` (landing, composed from `components/blocks/*`), `src/app/pdf-editor/` (the editor route mounting `Editor.Root`), and the analytics bridge.

For the full picture, read the [docs site](https://docs.docmosaic.com) — it documents every primitive, hook, and concept.

## Conventions — match these

-   **Bun, not npm.** (Use `yarn` only in React Native apps — not relevant here.)
-   **Prettier**: 4-space indent, single quotes, semicolons, 100-col, trailing commas. Enforced on commit.
-   **Conventional Commits**, validated by commitlint. Bare types (`refactor:`, not `refactor(scope):`). Subject only — no body unless the change really needs context.
-   **Dev port is 4001.** Anything saying `localhost:3000`/`4000` is stale.
-   **Path alias** `@/*` → `./src/*` in `apps/web` only. The packages use relative imports (they ship as published artifacts).
-   **Design tokens**: the `DOCMOSAIC_COLORS` palette is exposed in Tailwind as `docmosaic.*` (e.g. `text-docmosaic-orange`, `bg-docmosaic-cream`). Use the tokens, never raw hex.
-   **Geometry is stored in PDF points (72 DPI), never CSS pixels.** `createSection` converts px input via `px * 72/96` before persisting; the canvas applies its own zoom for display. Mixing units is the #1 source of subtle layout bugs — stay in points or convert explicitly.
-   **ESLint runs per-workspace** — rules don't bleed between them. Edit the workspace's own `eslint.config.mjs`.

## Testing

Vitest across the workspaces (~274 tests). Run `bun run test:run`.

The **byte-diff guard** at `packages/core/src/pdf/generate.test.ts` is load-bearing: it generates a PDF from a fixed fixture and compares the bytes to a checked-in snapshot. If the bytes shift, the cause is either intentional (update the snapshot deliberately) or a regression in the generation pipeline. Keep it green on every change to the PDF path.

## Version control

This repo is developed with **[GitButler](https://gitbutler.com)** (the `but` CLI). For agents: use `but` for all write operations (branch / commit / push) — not raw `git` for writes. Human contributors using plain git are welcome too; see [CONTRIBUTING.md](CONTRIBUTING.md).

-   Conventional Commits, subject-only. **Never push without an explicit go-ahead from the maintainer.**
-   The Husky hooks enforce the gate: `pre-commit` → typecheck + lint + Prettier; `commit-msg` → commitlint; `pre-push` → build.

## Publishing

The two packages release via **Changesets** with **OIDC trusted publishing** (no long-lived npm token):

-   Any package-affecting change needs a changeset: `bun run changeset`.
-   `.github/workflows/ci.yml` gates PRs (typecheck · lint · test · build). `.github/workflows/release.yml` opens a "Version Packages" PR and publishes on merge to `main`.
-   Keep `publint` and `attw` clean for both packages before a release.

## Non-negotiables / gotchas

-   **Geometry in PDF points (72 DPI)**, always.
-   **Exactly one `<DndProvider>`** — it lives in `Editor.Root`; don't nest another.
-   **`orderSectionsForRender`** (core) is the single source of render order across canvas / PDF / PNG. It's load-bearing for the byte-diff guard.
-   **Keep the byte-diff guard green.**
-   **Apps consume the built `packages/*/dist`** — after editing a package, rebuild it (`bun run --filter '@docmosaic/<pkg>' build`) for the change to show up in `apps/web` / `apps/docs`.

## See also

-   [CONTRIBUTING.md](CONTRIBUTING.md) — develop, test, and open a PR.
-   [docs.docmosaic.com](https://docs.docmosaic.com) — full primitive / hook / concept reference.
-   Tool-specific rule files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.windsurf/rules/`) — thin pointers back to this file.
