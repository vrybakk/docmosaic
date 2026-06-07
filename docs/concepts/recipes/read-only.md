# Recipe — Read-only viewer

Render a fully-composed editor as a viewer. Users can select, zoom, preview, and download a PDF / PNG, but nothing about the document is mutable.

## When you'd use this

- Embedding a finished contract / template for review.
- Sharing a built document with a stakeholder who shouldn't accidentally drag a section.
- Pairing an editable canvas with a frozen reference canvas in a compare view.
- A "preview" before commit step inside a multi-step flow.

## Basic — root-level `readOnly`

Pass `readOnly` on `Editor.Root`. Every primitive that lives inside reads `useEditor().readOnly` and adapts:

```tsx
import { Editor } from '@docmosaic/react';
import '@docmosaic/react/styles.css';

export function DocumentViewer({ document }: { document: Document }) {
    return (
        <Editor.Root defaultDocument={document} readOnly>
            <Editor.Properties />
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

What changes:

| Surface                     | Behavior in `readOnly`                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| Canvas drag / drop          | No-op. Section positions are frozen.                                         |
| Section resize              | Handles never render. Resize hook never arms.                                |
| Section file upload         | Drop, drag-over, click-to-upload are no-ops. Crop overlay is suppressed.     |
| Section floating toolbar    | Hidden — duplicate / delete / layer buttons aren't rendered.                 |
| Drawing mode                | Pointer captures ignored. The Draw button isn't rendered.                    |
| Page list                   | Add Image / Add Page buttons hidden. Per-page delete hidden. Reorder ignored.|
| Properties bar              | Document name input, page size, orientation select are `disabled`.           |
| PropertiesPanel             | Layout / Text / Shape inputs are `disabled`. Layer sub-section hides.        |
| Page background             | `Editor.PageBackground` returns `null`.                                      |
| Toolbar                     | `UndoButton`, `RedoButton`, `AddImageButton`, `AddTextButton`,               |
|                             | `AddShapeButton`, `DrawButton` return `null`.                                |
|                             | `PreviewButton`, `PrintButton`, `DownloadButton` stay live.                  |
| Keybindings                 | Every mutating action (undo, redo, delete, nudge) is suppressed.             |
|                             | `Escape` (deselect) still works.                                             |

Selection (click, shift-click, marquee) keeps working — read-only is about mutation, not navigation.

## Canvas-level — `Editor.StaticCanvas`

When the root is editable but a single canvas surface should refuse mutations, use `Editor.StaticCanvas`. The folding rule is `effectiveReadOnly = root.readOnly || canvas.readOnly`, so a static canvas inside an editable root acts read-only without affecting any other primitive.

```tsx
<Editor.Root defaultDocument={doc}>
    <Editor.Properties />
    <Editor.Toolbar />
    <div className="flex flex-1">
        <Editor.Pages />
        <Editor.StaticCanvas>
            <Editor.Section />
        </Editor.StaticCanvas>
    </div>
</Editor.Root>
```

This is the right primitive when:

- You want a side-by-side "current vs. reference" view.
- The root needs the toolbar / undo / page list to stay live for adjacent editable surfaces.
- You're rendering a snapshot inside an otherwise-editable flow.

`Editor.StaticCanvas` accepts the same `children` prop as `Editor.Canvas` (per-section template).

## Detecting read-only in custom primitives

Custom primitives that follow the `useEditor()` pattern can read the same flag and adapt:

```tsx
import { useEditor } from '@docmosaic/react';

function CustomAddButton() {
    const { actions, readOnly } = useEditor();
    if (readOnly) return null;
    return <button onClick={() => actions.addSection()}>Add</button>;
}
```

Or, for per-section UI:

```tsx
import { useEditorSection } from '@docmosaic/react';

function CustomSectionLabel() {
    const { rawSection, readOnly } = useEditorSection();
    return (
        <span>
            {rawSection.id}
            {readOnly && ' (locked)'}
        </span>
    );
}
```

## Export still works

`Editor.DownloadButton`, `Editor.PrintButton`, and `Editor.PreviewButton` are read-side surfaces — they consume document state, they don't mutate it. They stay mounted and enabled in `readOnly` mode so the viewer can produce a PDF / PNG / printed copy. The PDF pipeline (`pdfApi.download`, `pdfApi.downloadPNGs`, `pdfApi.print`) is unchanged.

## See also

- [Designer](../designer.md) — composition model and primitive layering.
- [Keybindings](../keybindings.md) — full default keymap.
- [`@docmosaic/react` README](../../../packages/react/README.md) — full API.
