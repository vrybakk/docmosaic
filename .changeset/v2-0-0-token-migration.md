---
'@docmosaic/react': major
---

Breaking: remove the legacy `editor-*` Tailwind color classes and the `--editor-color-*` CSS aliases. Use the shadcn-aligned semantic tokens instead (`bg-editor-accent` → `bg-primary`, `var(--editor-color-success)` → `var(--accent)`). Structural tokens (`rounded-editor-section`, `shadow-editor-section`, `--editor-radius-section`, `--editor-shadow-section`) are kept. See the v2.0 migration guide.
