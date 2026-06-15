# CLAUDE.md

Guidance for Claude Code in this repo. The full repo guide — structure, commands, conventions, architecture — lives in **[AGENTS.md](AGENTS.md)**, imported below; only Claude-specific notes live here.

@AGENTS.md

## Claude Code specifics

-   **Version control is GitButler.** Use the `but` CLI for every write (branch / commit / push) — never raw `git` for writes. Conventional Commits, subject-only, and **no Claude attribution** in commit messages. Never `git push` or open a PR without explicit confirmation.
-   **Keep the PDF byte-diff guard green** — `packages/core/src/pdf/generate.test.ts`. Treat any byte shift as load-bearing.
-   **Apps consume built `dist`.** After editing `packages/*`, run `bun run --filter '@docmosaic/<pkg>' build` before previewing in `apps/web` / `apps/docs`.
-   The dev server is on **port 4001**; use the `preview_*` tools (not raw Bash/Chrome) to verify browser changes.
