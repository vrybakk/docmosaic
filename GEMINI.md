# GEMINI.md

The full repo guide — structure, commands, conventions, architecture — lives in **[AGENTS.md](AGENTS.md)**, imported below.

@AGENTS.md

## Notes for Gemini CLI

Follow the conventions in AGENTS.md: Bun (not npm), Conventional Commits (bare types, subject only), Prettier (4-space / single quotes / 100-col), section geometry stored in PDF points (72 DPI), and keep the PDF byte-diff guard (`packages/core/src/pdf/generate.test.ts`) green. The dev server runs on port 4001.
