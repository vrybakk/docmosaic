# Contributing to DocMosaic

Thanks for your interest in DocMosaic. This file covers everything you need to develop, test, and ship a change.

## Develop locally

1. Clone the repo and install dependencies (Bun is required — see `packageManager` in `package.json`):

    ```bash
    git clone https://github.com/vrybakk/doc-mosaic.git
    cd doc-mosaic
    bun install
    ```

2. Boot the reference app:

    ```bash
    bun run dev
    ```

    The Next.js dev server runs on port **4001**. The editor lives at <http://localhost:4001/pdf-editor>.

3. While iterating, run the workspace gates from the repo root:

    ```bash
    bun run typecheck
    bun run lint
    bun run test:run
    bun run build
    ```

    Each command fans out across `@docmosaic/core`, `@docmosaic/react`, and `@docmosaic/web` via Turborepo. All four must pass before opening a PR.

## Repo layout

```text
packages/
├── core/           @docmosaic/core   — pure TS, no React
└── react/          @docmosaic/react  — UI primitives + hooks
apps/
└── web/            @docmosaic/web    — Next.js 15 reference app
docs/
└── SMOKE.md        Manual smoke checklist
```

## Writing a Changeset

Any change to `@docmosaic/core` or `@docmosaic/react` that ships to npm needs a Changeset. `@docmosaic/web` is in the `ignore` list — site-only changes don't need one.

```bash
bunx changeset
```

Pick the affected packages, choose the bump (`patch` / `minor` / `major`), and write a one-line summary of what changed. Commit the generated file under `.changeset/` along with your code.

When a release lands on `main`, `bun run version-packages` (`changeset version`) opens the version PR; `bun run release` publishes once that's merged.

## Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint via the `commit-msg` Husky hook:

-   `feat: …` — user-facing feature
-   `fix: …` — bug fix
-   `refactor: …` — internal change, no behavior change
-   `docs: …` — docs only
-   `chore: …` — tooling, deps, repo plumbing
-   `test: …` — tests only

Keep the subject under ~72 chars. One concern per commit; if a change touches the core, the React layer, and the reference app, split it where the seams are.

## Pull request process

1. Branch off `main` (or rebase before opening the PR).
2. Make sure typecheck, lint, test, and build all pass locally.
3. Walk through [`docs/SMOKE.md`](docs/SMOKE.md) for any change that touches the editor — it covers the regressions our automated tests don't.
4. Include a Changeset for npm-shipping packages.
5. Open the PR with a short summary of what changed and why. Screenshots help for UI work.

## Testing

-   `bun run test:run` runs every workspace's Vitest suite once.
-   `bun run test` watches.
-   Add unit tests next to the file they cover (`foo.test.ts` next to `foo.ts`).
-   The PDF byte-diff in `packages/core/src/pdf/generate.test.ts` is the canary for the rendering pipeline — it must keep passing across refactors.
-   Manual smoke checklist: [`docs/SMOKE.md`](docs/SMOKE.md).

## Reporting issues

Bug reports and feature requests go to the [issue tracker](https://github.com/vrybakk/doc-mosaic/issues). For bugs, please include reproduction steps, the page size + orientation, and a screenshot of the editor state if relevant.

## License

By contributing, you agree your contributions are licensed under the MIT License — see [LICENSE](LICENSE).
