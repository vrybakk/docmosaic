# RFC: Overridable labels (i18n-ready) for `@docmosaic/react`

Status: **proposed** (plan only — nothing implemented yet)
Scope: `packages/react` (the editor primitives). `@docmosaic/core` is untouched.

## Problem

Every user-facing string in the editor (`<Editor.Root>` and all primitives) is hardcoded
English inside the package. "Headless" today means state/behaviour/composition are
decoupled — but the **copy is not**. Consumers cannot translate, white-label, or adjust the
wording/accessibility strings without forking. This is a real limitation for a published,
reusable library.

Inventory: **~84 distinct strings + ~15 dynamic/interpolated** across ~30 files in
`packages/react/src/**`. No existing labels/i18n mechanism.

## Goals & principles

1. **i18n-agnostic.** The library must NOT depend on `next-intl`/`react-intl`/any i18n
   runtime. Consumers map their own translations (static dict, next-intl, react-intl, …).
2. **Backward compatible.** Omitting `labels` renders today's English UI byte-for-byte →
   a **minor** release, no breaking change.
3. **Total coverage.** Visible text **and** `aria-label` / `title` / `placeholder` /
   `sr-only` / toast messages. Accessibility strings are first-class.
4. **Partial overrides.** Deep-merge over English defaults; any omitted key falls back.
5. **Typed & discoverable.** Export the `EditorLabels` type and `defaultLabels`.
6. **PDF-safe.** Labels are editor chrome only; they never enter the document model, so the
   `packages/core` byte-diff guard is unaffected (verified).

## Public API

`Editor.Root` gains one optional prop:

```tsx
type EditorRootProps = {
  /* …existing props… */
  labels?: DeepPartial<EditorLabels>;
};
```

New public exports from `@docmosaic/react`:

```ts
export type { EditorLabels } from './context/labels';
export { defaultLabels, useLabels } from './context/labels';
// (LabelsProvider stays internal unless we want advanced composition)
```

Usage — override any subset, the rest stays English:

```tsx
<Editor.Root labels={{ toolbar: { undo: 'Deshacer', downloadPdf: 'Descargar PDF' } }} />
```

Consumer-side translation (e.g. apps/web with next-intl) maps its catalog into the shape:

```tsx
<Editor.Root labels={editorLabels(t)} />   // t = useTranslations('Editor')
```

## Architecture

New file `packages/react/src/context/labels.tsx`:

- `defaultLabels: EditorLabels` — the English source of truth.
- `LabelsContext` + `LabelsProvider` that **deep-merges** `props.labels` onto `defaultLabels`
  (memoized) and provides the resolved object.
- `useLabels(): EditorLabels` hook — returns the merged labels; never throws (defaults
  guarantee completeness).
- A tiny `deepMerge` util (or reuse one if present) — only plain objects merge; functions and
  primitives replace.

Provider placement in `editor-root.tsx` (mirrors the existing `EditorConfigProvider` pattern):

```tsx
<EditorConfigProvider ...>
  <LabelsProvider labels={props.labels}>   {/* NEW */}
    <DndProvider ...>
      <EditorProvider ...>
        {layout}
      </EditorProvider>
    </DndProvider>
  </LabelsProvider>
</EditorConfigProvider>
```

This sits above DnD + editor state so **every primitive, dialog, toast host, and the
app-shell** can read labels via `useLabels()`.

### Static vs dynamic strings

- **Static** strings are plain `string` fields.
- **Dynamic/interpolated** strings are **formatter functions** on the interface (no ICU
  parser, no new dependency, fully type-safe). Examples:
  `pageLabel(n)`, `layerPosition(num, total)`, `generating(progress)`,
  `zoomLevel(percent)`, `tooLarge(maxMb)`, `removeVertical(posPt)`, `pickColor(hex)`.
  This keeps pluralization/number-formatting in the consumer's control.

## The `EditorLabels` interface (grouped)

Nested groups for override ergonomics and readability. Final key names to be confirmed
against each file during implementation; this reflects the inventory.

```ts
export interface EditorLabels {
  toolbar: {
    undo: string; redo: string; preview: string; print: string;
    downloadPdf: string; downloadFormatMenu: string; downloadPng: string;
    cancel: string; dismiss: string; addImage: string; addPage: string;
    generating: (progress: number) => string;            // "Generating (45%)"
  };
  pages: {
    title: string;                                        // "Pages"
    count: (n: number) => string;                         // "Pages: 3"
    lastModified: (date: string) => string;
    pageLabel: (index: number) => string;                 // "Page 1"
    deletePage: (index: number) => string;                // "Delete page 1"
    cannotDeleteLast: string;                             // "Cannot delete the last page"
  };
  properties: {
    title: string; emptyState: string;
    position: string; x: string; y: string; positionX: string; positionY: string;
    size: string; width: string; height: string; w: string; h: string;
    text: string; font: string; fontSize: string;
    bold: string; italic: string; color: string;
    alignLeft: string; alignCenter: string; alignRight: string;
    pageSettings: string; pageSize: string; orientation: string;
    selectOrientation: string; selectPageSize: string; untitledDocument: string;
  };
  layers: {
    title: string;
    layerName: (label: string) => string;                 // aria "Layer Foo"
    layerPosition: (num: number, total: number) => string;
    bringToFront: string; sendToBack: string; moveUp: string; moveDown: string;
    show: string; hide: string; lock: string; unlock: string;
    doubleClickToRename: string; imagePreview: string;
    fillStroke: (fill: string, stroke: string) => string;
    frameFill: (fill: string) => string; ink: (color: string) => string;
    noColorPreview: string;
  };
  contextMenu: {
    copy: string; duplicate: string; delete: string;
    bringToFront: string; sendToBack: string; moveForward: string; moveBackward: string;
    show: string; hide: string; lock: string; unlock: string;
    paste: string; selectAll: string; deselect: string;
  };
  keyboardHelp: {
    title: string;
    groupEdit: string; groupSelection: string; groupMovement: string; groupView: string;
    undo: string; redo: string; clearSelection: string; deleteSelected: string;
    nudgeUp: string; nudgeDown: string; nudgeLeft: string; nudgeRight: string;
    nudgeUp10: string; nudgeDown10: string; nudgeLeft10: string; nudgeRight10: string;
    showShortcuts: string; unbound: string; or: string;
  };
  zoom: {
    zoomOut: string; zoomIn: string; fitToScreen: string; resetZoom: string;
    zoomLevel: (percent: number) => string;
  };
  shapeToolbar: {
    strokeColor: string; fillColor: string; noFill: string;
    strokeWidth: string; decreaseStroke: string; increaseStroke: string;
  };
  frameToolbar: {
    borderColor: string; noBorder: string; decreaseBorder: string; increaseBorder: string;
  };
  imageToolbar: { fitToProportion: string; cancelCrop: string; confirmCrop: string };
  colorPicker: {
    pickColor: (hex: string) => string; pickCustom: string;
    customColor: string; customColorInput: string;
  };
  brush: { weight: string };
  imageUpload: {
    invalidFile: string; tooLarge: (maxMb: number) => string;
    reading: string; processing: string; resizing: string; complete: string; error: string;
  };
  pageBackground: {
    clearColor: string; uploadImage: string; removeImage: string; clearBackground: string;
  };
  guides: {
    removeVertical: (posPt: number) => string;
    removeHorizontal: (posPt: number) => string;
  };
  appShell: {
    showLeftSidebar: string; hideLeftSidebar: string;
    showRightSidebar: string; hideRightSidebar: string;
  };
  section: { duplicate: string; delete: string };
  toasts: { pdfDownloaded: string; pdfCancelled: string; pdfFailed: string; printFailed: string };
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
```

## File-by-file task breakdown

Phase 0 (foundation) must land first; Phase 1 areas are independent and parallelizable
(each only edits its own files + reads the shared `useLabels`).

**Phase 0 — foundation**
- `src/context/labels.tsx` (new): `EditorLabels`, `defaultLabels`, `LabelsContext`,
  `LabelsProvider`, `useLabels`, `deepMerge`.
- `src/primitives/editor-root.tsx`: add `labels?` to `EditorRootProps`; mount `LabelsProvider`.
- `src/index.ts`: export `EditorLabels`, `defaultLabels`, `useLabels`.

**Phase 1 — wire primitives to `useLabels()`** (replace literals; add keys to `defaultLabels`)
| Area | Files | Keys |
|---|---|---|
| Toolbar | `primitives/toolbar/*` (undo/redo/preview/print/download buttons, generation-progress, index) | `toolbar.*` |
| Pages | `primitives/pages/index.tsx`, `pages/page-thumbnail.tsx` | `pages.*` |
| Properties panel | `primitives/properties-panel/*` (empty-state, layout/text/layer sections) | `properties.*`, some `layers.*` |
| Page settings | `primitives/properties/*` (index, orientation-select, page-size-select, document-name) | `properties.pageSettings/pageSize/orientation/...` |
| Layer list | `primitives/layer-list/*` (index, layer-row) | `layers.*` |
| Context menu | `primitives/context-menu.tsx` | `contextMenu.*` |
| Keyboard help | `primitives/keybinding-help.tsx` | `keyboardHelp.*` |
| Zoom | `primitives/zoom.tsx` | `zoom.*` |
| Shape toolbar | `primitives/section/shape-section/section-shape-toolbar.tsx`, `shape-section/index.tsx` | `shapeToolbar.*`, `section.*` |
| Frame toolbar | `primitives/section/frame-section/section-frame-toolbar.tsx`, `frame-section/index.tsx` | `frameToolbar.*`, `section.*` |
| Image section | `primitives/section/image-section/*` (section-toolbar, crop-overlay, use-image-upload) | `imageToolbar.*`, `imageUpload.*` |
| Color picker / brush | `primitives/color-picker.tsx`, `brush-weight-slider.tsx` | `colorPicker.*`, `brush.*` |
| Page background | `primitives/page-background.tsx` | `pageBackground.*` |
| Guides | `primitives/guides.tsx` | `guides.*` |
| App shell | `primitives/app-shell/top-bar.tsx`, `left-rail.tsx`, `inspector.tsx` | `appShell.*` + reuse panel titles |
| Preview | `primitives/preview/index.tsx` | `toolbar.preview` (reuse) |
| Toasts / PDF gen | `primitives/use-pdf-generation.ts`, `editor-root.tsx` (`cannotDeleteLast` alert) | `toasts.*`, `pages.cannotDeleteLast` |

Notes:
- `ui/*` (shadcn/radix low-level primitives) contain **no** product copy → skip.
- Hooks that emit toasts (`use-image-upload.ts`, `use-pdf-generation.ts`) read `useLabels()`
  too (they run inside the provider tree). Confirm each is called from within `Editor.Root`.

## Consumer wiring (apps/web) — follow-up, not part of this RFC's core

- Add an `Editor` namespace to `apps/web/messages/*.json` (or a dedicated `editor.<locale>.json`).
- A `editorLabels(t)` builder mapping the catalog → `DeepPartial<EditorLabels>`.
- `app/[locale]/pdf-editor/editor-mount.tsx`: pass `labels={editorLabels(t)}`; also localize the
  hardcoded "Back to DocMosaic" link (already in apps/web, trivial).
- ~84 strings × 8 locales → reuse the existing AI translate pipeline
  (`scripts/translate-messages.ts` / lingo.dev) to generate the locale catalogs.

## Testing

- Unit (`packages/react`): `defaultLabels` has every interface key; `deepMerge` partial
  override resolves correctly; `useLabels()` returns merged result.
- Render test: overriding e.g. `toolbar.undo` changes the rendered button label/aria.
- Keep the existing ~274 tests green; **byte-diff guard untouched** (no `core` changes).
- `publint` + `attw` clean for the package.

## Release

- **Minor** version bump via Changesets (`bun run changeset`) for `@docmosaic/react` —
  additive optional prop, backward compatible.
- Docs: document `labels` + `EditorLabels` on the docs site (new "Localization / labels" page).

## Effort & sequencing

- Phase 0 (foundation): ~2–4h.
- Phase 1 (extraction, parallelizable by area): ~4–6h.
- Phase 2 (tests + docs + changeset): ~3–5h.
- Phase 3 (apps/web translations, separate PR): reuse translate pipeline.

Recommend shipping **Phase 0–2 as one PR** (English defaults, fully overridable — the library
improvement) and **Phase 3 as a follow-up** (DocMosaic's own 8-locale editor translations).

## Open decisions (confirm before building)

1. **Grouping:** nested groups (recommended) vs flat keys.
2. **Dynamic strings:** formatter functions (recommended) vs ICU template strings.
3. **Prop name:** `labels` (recommended) vs `messages` / `dictionary`.
4. **Export surface:** export `defaultLabels` + `EditorLabels` + `useLabels` (recommended);
   keep `LabelsProvider` internal.
5. **apps/web translations:** same effort or follow-up (recommended: follow-up).
