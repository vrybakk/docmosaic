---
trigger: always_on
---

# DocMosaic — repo rules

Canonical guide: **[AGENTS.md](../../AGENTS.md)**. Key rules:

-   Bun, not npm. Dev server on port 4001.
-   Conventional Commits (bare types, subject only). Prettier: 4-space, single quotes, 100-col.
-   Section geometry stored in PDF points (72 DPI), not CSS pixels. Use `docmosaic.*` tokens, not raw hex.
-   Keep the PDF byte-diff guard green: `packages/core/src/pdf/generate.test.ts`.
-   Published packages `@docmosaic/core` + `@docmosaic/react` — add a changeset for package-affecting changes.
