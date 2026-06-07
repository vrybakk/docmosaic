# Layers

Every `Section` carries a `zIndex`. When two sections overlap, the higher `zIndex` paints on top — both on the canvas and in the exported PDF. Four reducer actions plus four toolbar buttons let users reorder layers without manipulating arrays directly. Operations are scoped per page; sections on other pages never influence the result.

## Mental model

`Section.zIndex` is just a number that defaults to `0`. Render order is `(zIndex asc, array index asc)` — lower draws first, higher draws on top, and ties fall back to insertion order so legacy documents (everything at `0`) render exactly as before. The PDF generator and the canvas preview both follow that same order, so what users see is what they get on download.

There's no "current layer" mode and no separate layer state — `zIndex` is part of the section. Reordering is a pure mutation; undo/redo cover it like any other reducer action.

## The four actions

```ts
import { useEditor } from '@docmosaic/react';

const { actions } = useEditor();
actions.bringToFront(sectionId);  // zIndex = max(peers) + 1
actions.sendToBack(sectionId);    // zIndex = min(peers) - 1
actions.moveForward(sectionId);   // swap zIndex with next-higher peer
actions.moveBackward(sectionId);  // swap zIndex with next-lower peer
```

| Action          | What it does                                                            |
| --------------- | ----------------------------------------------------------------------- |
| `bringToFront`  | Section's `zIndex` becomes `max(zIndex) + 1` of same-page peers.        |
| `sendToBack`    | Section's `zIndex` becomes `min(zIndex) - 1` of same-page peers.        |
| `moveForward`   | Swap `zIndex` with the next-higher peer on the same page. No-op if already on top.    |
| `moveBackward`  | Swap `zIndex` with the next-lower peer on the same page. No-op if already at the bottom. |

The matching dispatchable reducer actions (`BRING_TO_FRONT`, `SEND_TO_BACK`, `MOVE_FORWARD`, `MOVE_BACKWARD`) are exported from `@docmosaic/core` for callers driving the reducer directly.

## When you want layers

- **Overlapping images** — a portrait on a card background, a logo over a photo.
- **Watermarks / stamps** — a translucent "DRAFT" sitting above every content image.
- **Annotated callouts** — an arrow image layered on top of a screenshot.
- **Composite collages** — manually-ordered photo grids where the order matters.

If sections never overlap (a strict grid of disjoint rectangles), `zIndex` is invisible. The default of `0` everywhere just means "render in insertion order," which is the legacy behavior preserved by the array-index tiebreaker.

## Toolbar UI

`Editor.Section` exposes the four actions as icon buttons in the section's hover/selected toolbar, grouped with duplicate and delete:

| Button         | Icon          | Action                                                          |
| -------------- | ------------- | --------------------------------------------------------------- |
| Bring to front | `ChevronsUp`  | `actions.bringToFront(sectionId)`                               |
| Move forward   | `ChevronUp`   | `actions.moveForward(sectionId)`                                |
| Move backward  | `ChevronDown` | `actions.moveBackward(sectionId)`                               |
| Send to back   | `ChevronsDown`| `actions.sendToBack(sectionId)`                                 |

The toolbar appears on hover and stays visible while the section is selected. No additional wiring required — every layer action runs through the editor context so undo/redo, analytics, and the controlled-mode forward-pass all just work.

## Building your own UI

When you don't render `Editor.Section` directly, call the actions from your own toolbar:

```tsx
import { useEditor } from '@docmosaic/react';

function LayerControls({ sectionId }: { sectionId: string }) {
    const { actions } = useEditor();
    return (
        <div className="flex gap-1">
            <button onClick={() => actions.bringToFront(sectionId)}>Top</button>
            <button onClick={() => actions.moveForward(sectionId)}>Up</button>
            <button onClick={() => actions.moveBackward(sectionId)}>Down</button>
            <button onClick={() => actions.sendToBack(sectionId)}>Bottom</button>
        </div>
    );
}
```

Same actions, your visual. The reducer doesn't care who calls it.

## Future scope

A dedicated `Editor.LayerList` primitive — an outliner-style stack panel listing every section on the current page in z-order, with drag-to-reorder — is intentionally **not** part of v1. The per-section toolbar covers the common "this image needs to be on top" case; a list view is the right tool when users need to see the whole stack at once. Track it as a follow-up if you need bulk layer reordering or a Photoshop-style sidebar UI.

## See also

- [Designer](./designer.md) — selection model the layer buttons key off of
- [Keybindings](./keybindings.md) — actions you might wire to keyboard shortcuts in the future
- [`@docmosaic/react` README — Layers](../../packages/react/README.md#layers) — the canonical action surface
- [`packages/core/src/reducer.ts`](../../packages/core/src/reducer.ts) — `BRING_TO_FRONT` / `SEND_TO_BACK` / `MOVE_FORWARD` / `MOVE_BACKWARD` cases
