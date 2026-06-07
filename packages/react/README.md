# @docmosaic/react

React UI primitives for the DocMosaic editor — a fully client-side, drag-and-drop PDF builder that lets users arrange images into rectangular sections on a virtual page and export the result as a PDF in the browser. The package ships a compound `Editor.*` namespace plus headless hooks that wrap [`@docmosaic/core`](../core/README.md), so you can drop in the default shell or assemble your own UI on top of the same state machine.

See [`apps/web/public/showcases/hero.png`](../../apps/web/public/showcases/hero.png) for a screenshot of the default shell in the reference app.

## Concepts

Conceptual walk-throughs of how the editor is put together. Start here if you're new to the package, or jump straight to the API section below.

-   [Designer](../../docs/concepts/designer.md) — the `Editor.Root` + `Canvas` + `Section` composition and selection model
-   [Theming](../../docs/concepts/theming.md) — the `--editor-*` CSS-variable surface and the base / brand-theme split
-   [Unit system](../../docs/concepts/unit-system.md) — why geometry lives in PDF points and how to convert
-   [Keybindings](../../docs/concepts/keybindings.md) — default keymap, overrides, and standalone usage
-   [Layers](../../docs/concepts/layers.md) — the `zIndex` model and the four reorder actions

## Install

```bash
bun add @docmosaic/react @docmosaic/core react-dom
```

Peer dependencies:

-   `react@^19`
-   `react-dom@^19`
-   `@docmosaic/core` (workspace peer)

## Minimal example

```tsx
import { Editor } from '@docmosaic/react';
import '@docmosaic/react/styles.css';

export function MyEditor() {
    return (
        <Editor.Root>
            <Editor.Inspector />
            <Editor.Toolbar />
            <Editor.Pages />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
            <Editor.Preview />
        </Editor.Root>
    );
}
```

`Editor.Root` owns document state (reducer + history) internally in uncontrolled mode. The CSS import seeds the `--editor-*` theming tokens.

## Controlled mode

Pass `document` + `onDocumentChange` to drive state from outside. Undo/redo are disabled in controlled mode because the timeline lives outside the editor.

```tsx
import { createDocument } from '@docmosaic/core';

const [doc, setDoc] = useState(createDocument());

<Editor.Root document={doc} onDocumentChange={setDoc}>
    {/* same children as above */}
</Editor.Root>;
```

## Custom PDF backend

Swap the bundled `jspdf` pipeline for your own — e.g. a Worker, `pdf-lib`, or a server endpoint. `generate`, `estimate`, and `generatePNGs` can each be overridden; missing entries fall back to the `@docmosaic/core` defaults.

```tsx
import type { estimatePDFSize, generatePDF, generatePNGs } from '@docmosaic/core';

const generate: typeof generatePDF = async (sections, options, onProgress) =>
    myCustomRenderer(sections, options, onProgress);

const estimate: typeof estimatePDFSize = (sections, backgrounds) =>
    mySizeHeuristic(sections, backgrounds);

const generatePNGsImpl: typeof generatePNGs = async (sections, options, onProgress) =>
    myCustomPngRenderer(sections, options, onProgress);

<Editor.Root pdf={{ generate, estimate, generatePNGs: generatePNGsImpl }}>{/* … */}</Editor.Root>;
```

## PNG export

`Editor.DownloadButton` now ships as a split button: the primary click runs the PDF pipeline; the dropdown caret reveals **Download PNG (per page)**. The PNG path renders one file per page through a 2D canvas (offscreen when available, fallback to a hidden `<canvas>` element). The PDF and PNG outputs share layout but aren't expected to be pixel-identical — they go through different rasterizers.

You can also reach the underlying handler from the editor context:

```tsx
function CustomDownload() {
    const { pdfApi } = useEditor();
    return <button onClick={() => pdfApi.downloadPNGs()}>Export PNGs</button>;
}
```

## Templates

`Editor.TemplateGallery` renders a clickable grid of document snapshots. Selecting a card dispatches `actions.loadDocument` so the load goes through the history timeline — in uncontrolled mode, undo restores the previous document.

```tsx
import { Editor, type TemplateGalleryItem } from '@docmosaic/react';
import { createDocument } from '@docmosaic/core';

const templates: TemplateGalleryItem[] = [
    { id: 'blank', name: 'Blank', document: createDocument() },
    {
        id: 'invoice',
        name: 'Invoice',
        thumbnail: '/templates/invoice.png',
        document: invoiceDocument,
    },
];

<Editor.Root>
    <Editor.TemplateGallery templates={templates} onTemplateSelected={(t) => console.log(t.name)} />
    <Editor.Canvas>
        <Editor.Section />
    </Editor.Canvas>
</Editor.Root>;
```

Persist templates as JSON via `@docmosaic/core`'s `exportTemplate` / `importTemplate` — they're stable-order so the output diffs cleanly in version control.

## Custom image renderer

By default, section images render via a plain `<img>`. Override via `EditorConfigProvider` to wire `next/image`, a CDN loader, or anything else. Renderers must forward `ref` to the underlying `HTMLImageElement` — the canvas reads `naturalWidth` / `naturalHeight` off it.

```tsx
import { EditorConfigProvider } from '@docmosaic/react';
import Image from 'next/image';

<EditorConfigProvider value={{ imageRenderer: NextImageAdapter }}>
    <Editor.Root>{/* … */}</Editor.Root>
</EditorConfigProvider>;
```

## Theming

The editor reads CSS custom properties for every accent color, radius, and shadow. The stylesheet ships in layers so you can keep the structural defaults and swap only the brand colors:

-   `styles/base.css` — brand-agnostic structural tokens (`--editor-radius-section`, `--editor-shadow-section`).
-   `styles/themes/docmosaic.css` — the DocMosaic brand colors (`--editor-color-*` triplets). **Default.**
-   `styles/themes/minimal-dark.css` — shadcn-inspired neutral grays on a dark surface.
-   `styles/themes/minimal-light.css` — shadcn-inspired neutral grays on a white surface.
-   `styles.css` — convenience bundle that imports `base` + the DocMosaic brand theme.

### Default DocMosaic look

```ts
import '@docmosaic/react/styles.css';
```

### Minimal dark (shadcn-inspired)

```ts
import '@docmosaic/react/styles/base.css';
import '@docmosaic/react/styles/themes/minimal-dark.css';
```

### Minimal light (shadcn-inspired)

```ts
import '@docmosaic/react/styles/base.css';
import '@docmosaic/react/styles/themes/minimal-light.css';
```

### Custom theme on the shared base

Supply your own `--editor-color-*` values in a stylesheet next to your app code, then import the base first so structural defaults come along:

```ts
import '@docmosaic/react/styles/base.css';
import './my-theme.css';
```

```css
/* my-theme.css */
:root {
    --editor-color-accent: 30 41 59; /* slate-800 */
    --editor-color-accent-soft: 226 232 240; /* slate-200 */
    --editor-color-success: 34 197 94; /* green-500 */
    --editor-color-warning: 234 88 12; /* orange-600 */
    --editor-color-warning-soft: 251 191 36; /* amber-400 */
    --editor-color-surface: 255 255 255;
    --editor-color-text: 15 23 42; /* slate-900 */
}
```

### Explicit DocMosaic theme on the base

Same as `styles.css` but spelled out — useful when you want to layer the brand theme conditionally:

```ts
import '@docmosaic/react/styles/base.css';
import '@docmosaic/react/styles/themes/docmosaic.css';
```

### Token reference

Color tokens (RGB triplets — space-separated for `rgb(R G B / <alpha-value>)`):

| Token                        | Purpose                                                       | DocMosaic value      |
| ---------------------------- | ------------------------------------------------------------- | -------------------- |
| `--editor-color-accent`      | Primary accent — buttons, active section borders, focus rings | `56 29 42` (#381D2A) |
| `--editor-color-accent-soft` | Soft accent — hover states, subtle highlights                 | `252 222 156`        |
| `--editor-color-success`     | Success state — confirmation, completed steps                 | `196 214 176`        |
| `--editor-color-warning`     | Warning — destructive actions, alerts                         | `186 86 36`          |
| `--editor-color-warning-soft`| Soft warning — caution badges, partial states                 | `255 165 82`         |
| `--editor-color-surface`     | Editor background surface                                     | `255 255 255`        |
| `--editor-color-text`        | Default editor text color                                     | `56 29 42`           |

Structural tokens:

| Token                     | Purpose                          | Default                       |
| ------------------------- | -------------------------------- | ----------------------------- |
| `--editor-radius-section` | Border radius for image sections | `6px`                         |
| `--editor-shadow-section` | Shadow for image sections        | `0 1px 3px rgba(0, 0, 0, 0.1)`|

## Keybindings

`Editor.Root` ships with a default keyboard-shortcut layer. Shortcuts are skipped while focus is in an `<input>`, `<textarea>`, `<select>`, or anything `contenteditable`, so text fields stay typeable.

Default keymap (`mod` = Cmd on macOS, Ctrl elsewhere):

| Action            | Default binding                  |
| ----------------- | -------------------------------- |
| Undo              | `mod+z`                          |
| Redo              | `mod+shift+z`, `mod+y`           |
| Delete section    | `Delete`, `Backspace`            |
| Deselect          | `Escape`                         |
| Nudge by 1pt      | `ArrowUp/Down/Left/Right`        |
| Nudge by 10pt     | `Shift+ArrowUp/Down/Left/Right`  |

### Override individual bindings

Pass a `Partial<EditorKeymap>` — anything omitted keeps its default. Use an array to register alternates.

```tsx
<Editor.Root
    keybindings={{
        redo: 'mod+r',
        deleteSection: ['Delete', 'Backspace', 'x'],
    }}
>
    {/* … */}
</Editor.Root>
```

### Disable all shortcuts

```tsx
<Editor.Root keybindings={false}>{/* … */}</Editor.Root>
```

The headless hook is also exported for "BYO-UI" trees that mount their own provider:

```tsx
import { useEditorKeybindings, DEFAULT_KEYMAP } from '@docmosaic/react';
```

## Section types

A `Section` is a discriminated union on the `type` field. Four variants ship today:

| Variant | Discriminator     | Renders                                  |
| ------- | ----------------- | ---------------------------------------- |
| Image   | `type: 'image'`   | `Editor.Section` → `ImageSectionView`    |
| Text    | `type: 'text'`    | `Editor.Section` → `TextSectionView`     |
| Shape   | `type: 'shape'`   | `Editor.Section` → `ShapeSectionView`    |
| Drawing | `type: 'drawing'` | `Editor.Section` → `DrawingSectionView`  |

`Editor.Section` is a dispatcher — it reads `section.type` from `useEditorSection()` and renders the matching view. All variants share the same drag + resize + selection shell. Legacy documents without a `type` field are normalized to `'image'` via `normalizeSection`.

Add a new section of any variant from the toolbar:

```tsx
<Editor.AddSectionButton />              {/* Image */}
<Editor.AddTextButton />                 {/* Text */}
<Editor.AddShapeButton shape="rect" />   {/* Rectangle */}
<Editor.AddShapeButton shape="circle" /> {/* Circle */}
<Editor.AddShapeButton shape="line" />   {/* Line */}
<Editor.DrawButton />                    {/* Toggle drawing mode */}
```

Programmatically:

```tsx
const { actions } = useEditor();
actions.addSection({ type: 'image' });
actions.addSection({ type: 'text' });
actions.addSection({ type: 'shape', shape: 'circle' });
actions.addSection({ type: 'drawing' });
```

### Page background

Each page can carry an optional `background` (color, image, or both) layered behind sections. The bundled `Editor.PageBackgroundPicker` drives the `setPageBackground` action — drop it next to the canvas, or wire your own picker:

```tsx
<Editor.PageBackgroundPicker />              {/* targets the active page */}
<Editor.PageBackgroundPicker pageIndex={1} />

const { actions } = useEditor();
actions.setPageBackground(0, { color: '#f5f5f5' });
actions.setPageBackground(0, undefined); // clear
```

### Image section

Image sections fill their box with a base64 data URL. Drag-and-drop or the inline file picker writes the URL into the section.

| Field      | Type         | Notes                                              |
| ---------- | ------------ | -------------------------------------------------- |
| `type`     | `'image'`    | Discriminator.                                     |
| `imageUrl` | `string?`    | Base64 data URL. Empty box when unset.             |
| `crop`     | `ImageCrop?` | Optional non-destructive crop region (PDF points). |

```tsx
import type { ImageSection } from '@docmosaic/core';

const section: ImageSection = {
    id: 'a',
    type: 'image',
    x: 36,
    y: 36,
    width: 200,
    height: 150,
    page: 1,
    zIndex: 0,
    imageUrl: 'data:image/png;base64,...',
};
```

#### Crop

Double-click an image section in the editor to enter crop mode. The overlay dims the area outside the crop window and exposes 8 resize handles; confirm with the check button or press the close button to discard. The crop is stored as `{ x, y, width, height }` in PDF points (relative to the section's bounding box) — the original `imageUrl` is preserved, so the operation is fully non-destructive.

The PDF and PNG generators both honor the crop. When the crop equals the full section box it's stored as `undefined`, so documents that never touched the feature emit byte-identical PDFs to pre-crop releases.

```tsx
const cropped: ImageSection = {
    ...section,
    crop: { x: 25, y: 20, width: 100, height: 80 },
};
```

### Text section

Text sections render their body with the bundled typography props. Click the section to select, then click again (or double-click) to edit inline; blur to exit. The floating toolbar exposes alignment, bold, italic, and font-size +/-.

| Field        | Type                              | Default       |
| ------------ | --------------------------------- | ------------- |
| `type`       | `'text'`                          | —             |
| `text`       | `string`                          | `''`          |
| `fontFamily` | `string?`                         | `'helvetica'` |
| `fontSize`   | `number` (points)                 | `16`          |
| `fontWeight` | `'normal' \| 'bold'?`             | `'normal'`    |
| `fontStyle`  | `'normal' \| 'italic'?`           | `'normal'`    |
| `color`      | `string?` (any CSS color)         | `'rgb(0,0,0)'`|
| `align`      | `'left' \| 'center' \| 'right'?`  | `'left'`      |
| `lineHeight` | `number?` (multiplier)            | `1.15`        |

```tsx
import type { TextSection } from '@docmosaic/core';

const section: TextSection = {
    id: 'b',
    type: 'text',
    x: 72,
    y: 72,
    width: 400,
    height: 80,
    page: 1,
    zIndex: 0,
    text: 'Hello DocMosaic',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(0,0,0)',
    align: 'left',
};
```

### Drawing section

Drawing sections capture freehand pointer drags as polylines. Click `Editor.DrawButton` to enter drawing mode — the canvas cursor switches to a crosshair, and each click-and-drag commits a stroke into a fresh `DrawingSection`. Subsequent drags on the same surface create more sections; drags on top of an existing drawing section append to that section's stroke list. Press `Escape` to exit.

```
┌───────────────────────────┐
│  page                     │
│   ┌───── DrawingSection ──┐
│   │   stroke A (red)      │
│   │      ╱╲    ╱╲         │
│   │   __╱  ╲__╱  ╲___     │
│   │   stroke B (green)    │
│   │     ⌒‾‾⌒              │
│   └───────────────────────┘
│                           │
└───────────────────────────┘
```

| Field     | Type        | Notes                                                       |
| --------- | ----------- | ----------------------------------------------------------- |
| `type`    | `'drawing'` | Discriminator.                                              |
| `strokes` | `Stroke[]`  | Append-only list. Each stroke carries `points`, `color`, `weight`. |

```tsx
import type { DrawingSection } from '@docmosaic/core';

const section: DrawingSection = {
    id: 'c',
    type: 'drawing',
    x: 72,
    y: 72,
    width: 400,
    height: 300,
    page: 1,
    zIndex: 0,
    strokes: [
        {
            color: '#c97b22',
            weight: 3,
            points: [
                { x: 80, y: 90 },
                { x: 120, y: 140 },
                { x: 160, y: 100 },
            ],
        },
    ],
};
```

The brush color and weight live on the editor's UI state (`ui.drawingColor`, `ui.drawingWeight`). `Editor.DrawingControls` composes `Editor.ColorPicker` + `Editor.BrushWeightSlider` with "Clear" and "Done" actions to drive them:

```tsx
<Editor.DrawingControls />
```

Or assemble the pieces directly:

```tsx
const { ui } = useEditor();

<Editor.ColorPicker value={ui.drawingColor} onChange={ui.setDrawingColor} />
<Editor.BrushWeightSlider value={ui.drawingWeight} onChange={ui.setDrawingWeight} />
```

Two reducer actions drive strokes: `ADD_STROKE` (append-only) and `CLEAR_STROKES` (empty the section's list). Both are exposed via `EditorActions`:

```tsx
const { actions } = useEditor();
actions.addStroke(sectionId, { points: [...], color: '#000', weight: 2 });
actions.clearStrokes(sectionId);
```

## Layers

Every `Section` carries a `zIndex` (default `0`). The PDF generator and the on-canvas preview render sections in `(zIndex asc, array index asc)` order — lower draws first, higher draws on top. Ties fall back to insertion order so legacy documents (where every section sits at `zIndex: 0`) render exactly as before.

The `Editor.Section` toolbar exposes four icon buttons grouped with duplicate/delete:

| Button         | Icon          | Action                                                          |
| -------------- | ------------- | --------------------------------------------------------------- |
| Bring to front | `ChevronsUp`  | `zIndex` becomes `max(zIndex) + 1` on the same page             |
| Move forward   | `ChevronUp`   | Swap `zIndex` with the next-higher peer on the same page        |
| Move backward  | `ChevronDown` | Swap `zIndex` with the next-lower peer on the same page         |
| Send to back   | `ChevronsDown`| `zIndex` becomes `min(zIndex) - 1` on the same page             |

Layer operations are scoped per page — sections on other pages never influence the result. `MOVE_FORWARD` / `MOVE_BACKWARD` are no-ops when the target is already on top / at the bottom of its page.

`EditorActions` (and the per-section `useEditorSection()` result) exposes the same four operations programmatically:

```tsx
const { actions } = useEditor();
actions.bringToFront(sectionId);
actions.sendToBack(sectionId);
actions.moveForward(sectionId);
actions.moveBackward(sectionId);
```

The same actions are available as dispatchable reducer actions — `BRING_TO_FRONT`, `SEND_TO_BACK`, `MOVE_FORWARD`, `MOVE_BACKWARD` — from `@docmosaic/core` for callers driving the reducer directly.

> **Future scope:** a dedicated `Editor.LayerList` primitive (an outliner-style stack panel) is intentionally not shipped in this version — the per-section toolbar buttons cover the v1 use case. Track it as a follow-up if you need bulk layer reordering or a sidebar UI.

## Multi-select + snap

The editor supports multi-section selection out of the box. The selection lives on the editor's UI state as `ui.selectedSectionIds: Set<string>` — `Editor.Canvas` reacts to three input patterns:

| Input                          | Effect                                                                |
| ------------------------------ | --------------------------------------------------------------------- |
| Click a section                | Replaces the selection with that section.                             |
| `Shift`/`Cmd` + click section  | Toggles the section in/out of the selection without touching others.  |
| Click-and-drag on empty canvas | Draws a marquee box; sections whose bbox intersects it get selected.  |
| Click on empty canvas (no drag)| Clears the selection.                                                 |

When `selectedSectionIds.size > 1`, the Canvas renders `Editor.SelectionBounds` — a dashed group rectangle with 8 resize handles. Dragging any handle scales every selected section proportionally about the group bbox. Dragging any selected section translates the entire group together; arrow keys (and `Shift+Arrow`) nudge every selected section at once.

### Snap guides

While a multi-select group is being dragged, the editor compares each group edge (left/right/top/bottom/horizontal-mid/vertical-mid) against:

- the page margins (left, right, top, bottom)
- the page mid-lines (vertical center, horizontal middle)
- the edges + center / middle of every non-selected section on the same page

Any candidate within `SNAP_THRESHOLD` (5px) wins — the group snaps to it and `Editor.SnapGuides` paints a thin accent-colored line spanning the page so the alignment is visible. Guides clear automatically on pointer release.

```tsx
import { Editor, useEditor } from '@docmosaic/react';

function SelectAllSections() {
  const editor = useEditor();
  React.useEffect(() => {
    editor.ui.selectMany(editor.state.sections.map((s) => s.id));
  }, []);
  return null;
}

<Editor.Root>
  <SelectAllSections />
  <Editor.Canvas>
    <Editor.Section />
  </Editor.Canvas>
</Editor.Root>;
```

The selection action surface (mirrors the keyboard / pointer paths the canvas uses):

```tsx
const { ui } = useEditor();

ui.setSelectedSectionId(id);       // replace selection with a single id (or null)
ui.selectMany([id1, id2, id3]);    // replace selection with the given ids
ui.addToSelection(id);             // grow the set
ui.removeFromSelection(id);        // shrink the set
ui.toggleSelection(id);            // shift+click behavior
ui.clearSelection();               // empty
```

Single-select callers can keep reading `ui.selectedSectionId` — it returns the first id of the set (or `null` when empty).

## Analytics callback

`@docmosaic/react` ships a no-op analytics tracker. Install your provider once at boot — Vercel `track`, PostHog `capture`, anything matching the `(event, payload)` signature. Events fire only when `process.env.NODE_ENV === 'production'`.

```ts
import { setReactPackageTracker } from '@docmosaic/react';
import { track } from '@vercel/analytics';

setReactPackageTracker((event, payload) => track(event, payload));
```

## Headless API

Reach past the compound primitives to drive your own UI from the same reducer + history timeline:

```tsx
import { createDocument } from '@docmosaic/core';
import { useDocumentState } from '@docmosaic/react';

const { document, canUndo, canRedo, actions } = useDocumentState({
    initialDocument: createDocument(),
});
```

`actions` is a stable method surface (`undo`, `redo`, `addSection`, `updateSection`, `deleteSection`, `duplicateSection`, `addStroke`, `clearStrokes`, `addPage`, `deletePage`, `changePage`, `updatePageSize`, `updateOrientation`, `updateName`, `reorderPages`, `updateEstimatedSize`, `setPageBackground`, `bringToFront`, `sendToBack`, `moveForward`, `moveBackward`). See the [JSDoc on `useDocumentState`](src/hooks/use-document-state.ts) for parameter details.

## Full API reference

Every export is documented inline with JSDoc; the generated declarations land at `dist/index.d.ts` after `bun run build`. The public surface is:

-   `Editor` namespace — `Root`, `Inspector`, `Toolbar`, `Pages`, `Canvas`, `Section`, `Preview`, `TemplateGallery`, `DrawingControls`, `ColorPicker`, `BrushWeightSlider`, and their child buttons/selects (including `DrawButton`). Back-compat: `Editor.Header` (= `Inspector`), `Editor.PageList` (= `Pages`), and `Editor.PageThumb` (= `PageThumbnail`) are kept as `@deprecated` aliases for the next major.
-   Hooks — `useDocumentState`, `useEditor`, `useEditorCanvas`, `useEditorSection`, `useEditorKeybindings`, `usePdfGeneration`.
-   Providers — `EditorProvider`, `EditorConfigProvider`, `EditorConfigContext`.
-   Helpers — `defaultImageRenderer`, `setReactPackageTracker`, `EditorLayout`, `DEFAULT_KEYMAP`.
-   Types — `EditorRootProps`, `EditorActions`, `EditorContextValue`, `EditorPdfApi`, `EditorPdfBackend`, `EditorUiState`, `EditorKeybinding`, `EditorKeymap`, `EditorConfig`, `ImageRenderer`, `ImageRendererProps`, `GenerationState`, `AnalyticsTracker`, `TemplateGalleryItem`, `TemplateGalleryProps`, `UseEditorSectionResult`.

## Compatibility

-   React 19+ (peer-pinned).
-   Tested with Next.js 15 (App Router) — see [`apps/web`](../../apps/web) for the reference integration, including the `'use client'` boundary required to mount `Editor.Root` from a Server Component.

## License

MIT.
