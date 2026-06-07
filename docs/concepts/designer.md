# Designer

The DocMosaic editor is a **designer for printable documents** — users arrange image sections on a virtual page and export a PDF. `@docmosaic/react` exposes that designer as a small set of compound primitives that snap together; `@docmosaic/core` is the headless state machine they all read from. Same model, two surfaces.

## Mental model

Think of the editor as three concentric layers:

1. **State** — a single `Document` carrying `pages`, a flat `sections` array, and metadata (`name`, `pageSize`, `orientation`). All geometry is in [PDF points](./unit-system.md).
2. **Actions** — a stable 18-method surface (`addSection`, `updateSection`, `bringToFront`, `undo`, …) that produces the next document. The bundled reducer wraps these with a history timeline so undo/redo "just work."
3. **UI** — the `Editor.*` compound namespace. Every primitive reads its slice of state from context and dispatches actions back; nothing is prop-drilled.

```text
Editor.Root                        ← owns Document + history + DnD provider
 ├─ Editor.Inspector               ← document name, page size, orientation
 ├─ Editor.Toolbar                 ← undo/redo, preview, download, add-section
 ├─ Editor.Pages                   ← left rail of page thumbnails
 ├─ Editor.Canvas                  ← interactive workspace (drag, resize, zoom)
 │   └─ Editor.Section             ← one image rectangle on the canvas
 └─ Editor.Preview                 ← full-document preview dialog
```

`Editor.Root` arranges its children into the default shell automatically — `Pages` is forced to the left of `Canvas` regardless of source order — so the flat composition above works out of the box.

## Composition

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

The CSS import seeds the `--editor-*` tokens documented in [Theming](./theming.md). Drop any primitive — or build your own from `useEditor()` — and the rest of the tree keeps working.

## Selection model

The editor tracks a **single selected section** at a time (`ui.selectedSectionId`). Selection drives:

- The visible toolbar on `Editor.Section` (fit / layer / duplicate / delete buttons).
- Keyboard nudge + delete bindings (see [Keybindings](./keybindings.md)).
- Resize handles and the focus outline.

Clicking a section selects it; clicking the canvas background, hitting `Escape`, or deleting the selected section clears the selection. Multi-select is intentionally not part of the v1 surface — most flows that "want" multi-select are better expressed via layer actions on a single section.

## Drag, resize, upload

The Canvas wires every section to three gestures:

- **Drag** — pointer down on a section, move, pointer up. The reducer applies `UPDATE_SECTION` with the new `(x, y)`.
- **Resize** — drag the right, bottom, or bottom-right handle. The Canvas captures the start size and dispatches incremental `UPDATE_SECTION` calls.
- **Image upload** — drop a file onto a section (or click the empty-state). The reader produces a data URL, which becomes `section.imageUrl`.

Drag-and-drop is powered by `react-dnd` with the HTML5 backend. `Editor.Root` mounts a single `<DndProvider>` for the whole tree — don't nest another.

## Headless mode

When the compound shell isn't a fit (custom layout, native app, Server Components downstream), use the headless hook directly. It owns the same reducer + history:

```tsx
import { createDocument } from '@docmosaic/core';
import { useDocumentState } from '@docmosaic/react';

function CustomEditor() {
    const { document, canUndo, canRedo, actions } = useDocumentState({
        initialDocument: createDocument(),
    });

    return (
        <div>
            <button disabled={!canUndo} onClick={actions.undo}>
                Undo
            </button>
            <button disabled={!canRedo} onClick={actions.redo}>
                Redo
            </button>
            <button onClick={actions.addSection}>Add section</button>
            <p>
                {document.name} — {document.sections.length} sections
            </p>
        </div>
    );
}
```

`actions` is referentially stable; `document`, `canUndo`, and `canRedo` re-render on every change. Wrap the same value in `EditorProvider` if you want compound primitives to see your custom-built state.

## Controlled vs. uncontrolled

`Editor.Root` works in both modes:

- **Uncontrolled** (default) — omit `document`. The root owns state internally. Pass `defaultDocument` to seed it.
- **Controlled** — pass `document` + `onDocumentChange`. Every mutation calls back out; the parent is responsible for re-rendering. Undo/redo are disabled because the timeline lives outside.

```tsx
const [doc, setDoc] = useState(createDocument());

<Editor.Root document={doc} onDocumentChange={setDoc}>
    {/* … */}
</Editor.Root>;
```

Don't mix modes mid-render — the root warns in development if you do.

## See also

- [Unit System](./unit-system.md) — why geometry is stored in points and how to convert
- [Theming](./theming.md) — the `--editor-*` CSS-variable surface
- [Keybindings](./keybindings.md) — default shortcuts and how to override
- [Layers](./layers.md) — z-index actions for overlapping sections
- [`@docmosaic/react` API reference](../../packages/react/README.md) — every export with JSDoc
- [`@docmosaic/core` API reference](../../packages/core/README.md) — the framework-agnostic core
