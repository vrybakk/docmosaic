# @docmosaic/core

Framework-agnostic TypeScript core for the DocMosaic editor — the document model, page-size + dimension helpers, a pure reducer with a history HOC, and the browser-side PDF generation pipeline. No React, no DOM coupling beyond what `jspdf` itself needs at call time.

Use this package directly when you want to build your own editor UI (web, native, headless), generate PDFs from scratch, or test logic without rendering anything. [`@docmosaic/react`](../react/README.md) is one such UI built on top of it.

## Install

```bash
bun add @docmosaic/core
```

Runtime dependencies:

-   `jspdf@^2.5` (only loaded when `generatePDF` runs)
-   `uuid@^11`

## Quick example

```ts
import { createDocument, createSection, generatePDF } from '@docmosaic/core';

const doc = createDocument();
doc.sections.push(createSection());

const blob = await generatePDF(doc.sections, {
    pageSize: doc.pageSize,
    orientation: doc.orientation,
    pages: doc.pages,
});

// Save it however you like.
const url = URL.createObjectURL(blob);
```

`generatePDF` reports progress via an optional third argument and throws `Error('PDF generation cancelled')` when its `AbortSignal` aborts — preserve that exact message if you wrap it; downstream callers match on it.

## Reducer + history

The reducer is pure: no clock reads, no mutation, no side effects. Wrap it with `withHistory` to gain undo/redo over any sequence of actions.

```ts
import { createDocument, reducer, withHistory, type Action } from '@docmosaic/core';

const tracked = withHistory<ReturnType<typeof createDocument>, Action>(reducer);

let state = { present: createDocument(), past: [], future: [] };
state = tracked(state, { type: 'ADD_SECTION' });
state = tracked(state, { type: 'UPDATE_NAME', name: 'Invoice' });
state = tracked(state, { type: 'UNDO' }); // back to one section, default name
state = tracked(state, { type: 'REDO' }); // back to 'Invoice'
```

Action types are SCREAMING_SNAKE_CASE and accept an optional `now: Date` for clock-pinned tests.

## Use case: building your own editor UI

The most common consumer is a UI layer:

1. Seed state via `createDocument()` (or rehydrate one of your own).
2. Drive mutations through `reducer` / `withHistory` — or `useReducer(withHistory(reducer), …)` in React.
3. Render whatever you want from `document.pages` + `document.sections`. Geometry is stored in PDF points (72 DPI); convert to CSS pixels for display.
4. Call `generatePDF(document.sections, options)` when the user hits "Download". Use `estimatePDFSize` for a cheap live size hint.

[`@docmosaic/react`](../react/README.md) does exactly this — it's a useful reference for the wiring.

## Public surface

Every export is documented with JSDoc; the generated declarations land at `dist/index.d.ts` after `bun run build`. The package's public surface:

-   Types — `Document`, `Page`, `PageBackground`, `Section`, `ImageSection`, `ImageCrop`, `TextSection`, `ShapeSection`, `ShapeKind`, `DrawingSection`, `Stroke`, `Point`, `PageSize`, `PageOrientation`, `PageDimensions`, `MeasurementUnit`, `DragPosition`, `ResizeInfo`, `PDFGenerationOptions`. See [the Unit system concept doc](../../docs/concepts/unit-system.md) for why geometry is in points and how to convert.
-   Page-size data — `CUSTOM_PAGE_SIZES`, `PAGE_SIZE_LABELS`, `getPageDimensions`, `getPageDimensionsWithOrientation`.
-   Dimension helpers — `convertDimensions`, `formatDimensions`, `mmToPt`, `ptToMm`.
-   PDF — `generatePDF`, `estimatePDFSize`, `optimizeImageForPDF`, `processImagesForPDF`, types `GenerationOptions` / `GenerationProgress`.
-   PNG — `generatePNGs`, types `PNGGenerationOptions` / `PNGGenerationProgress`.
-   Templates — `exportTemplate`, `importTemplate`, type `DocumentTemplate`.
-   Factories — `createDocument`, `createPage`, `createSection`.
-   State — `reducer`, `withHistory`, types `Action`, `State`, `HistoryAction`, `HistoryState`.

## Image crop

`ImageSection` carries an optional `crop` field — a rectangle in PDF points relative to the section's bounding box. When set, only that region of the source image is rendered inside the section; the original `imageUrl` is preserved, so the operation is fully non-destructive.

```ts
import type { ImageSection } from '@docmosaic/core';

const section: ImageSection = {
    id: 'photo',
    type: 'image',
    x: 40,
    y: 40,
    width: 200,
    height: 150,
    page: 1,
    zIndex: 0,
    imageUrl: 'data:image/png;base64,...',
    crop: { x: 25, y: 20, width: 100, height: 80 },
};
```

Documents authored before this field existed still load — `crop` is optional, and omitting it takes the original byte-stable `addImage` path through jsPDF.

## Templates

A template is a `Document` snapshot. Use `exportTemplate` to serialize one to a JSON string (stable key order for diff-friendly output) and `importTemplate` to load it back with rehydrated `createdAt` / `updatedAt` dates.

```ts
import { exportTemplate, importTemplate } from '@docmosaic/core';

const json = exportTemplate(doc);
// Persist `json` anywhere — local storage, a file, a URL hash.
const restored = importTemplate(json); // throws on shape mismatch
```

## PNG export

`generatePNGs` renders one PNG `Blob` per page via a 2D canvas pipeline (mirrors the PDF layer order). Use it alongside `generatePDF` when you want per-page raster output. The PNG and PDF pipelines aren't expected to be pixel-identical — they share layout but go through different rasterizers.

```ts
import { generatePNGs } from '@docmosaic/core';

const pngs = await generatePNGs(doc.sections, {
    pageSize: doc.pageSize,
    orientation: doc.orientation,
    pages: doc.pages,
    scale: 2, // 144 DPI; default is 2
});
```

## License

MIT.
