# Copilot instructions — DocMosaic

The canonical contributor & agent guide is **[AGENTS.md](../AGENTS.md)** — read it for full structure, commands, and architecture. Highlights:

-   Bun is the package manager / runtime (not npm). Dev server: port 4001.
-   Conventional Commits (bare types, subject only). Prettier: 4-space, single quotes, 100-col.
-   Section geometry is stored in PDF points (72 DPI), never CSS pixels.
-   Use the `docmosaic.*` Tailwind tokens, not raw hex.
-   Keep the PDF byte-diff guard green: `packages/core/src/pdf/generate.test.ts`.
-   Published packages `@docmosaic/core` + `@docmosaic/react` — add a changeset for package-affecting changes.
