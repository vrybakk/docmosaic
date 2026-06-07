# Keybindings

`Editor.Root` ships a built-in keyboard layer. Cmd/Ctrl+Z for undo, arrows to nudge the selected section, Delete to remove it, Escape to deselect — the conventions consumers expect from Figma, Notion, and every other doc-editing tool. The layer is fully overridable: tweak a single action, register alternates, or turn the whole thing off.

## Default keymap

`mod` resolves to **Cmd on macOS, Ctrl elsewhere** — prefer it over hard-coded `cmd`/`ctrl`. Bindings are skipped while focus is inside an `<input>`, `<textarea>`, `<select>`, or anything `contenteditable`, so text fields like the document-name input stay typeable.

| Action          | Default binding                  |
| --------------- | -------------------------------- |
| Undo            | `mod+z`                          |
| Redo            | `mod+shift+z`, `mod+y`           |
| Delete section  | `Delete`, `Backspace`            |
| Deselect        | `Escape`                         |
| Nudge by 1pt    | `ArrowUp/Down/Left/Right`        |
| Nudge by 10pt   | `Shift+ArrowUp/Down/Left/Right`  |
| Show shortcuts  | `mod+/`                          |

Nudge values are in points — see [Unit system](./unit-system.md) for why.

## Show the active keymap with `Editor.KeybindingHelp`

Drop `Editor.KeybindingHelp` anywhere inside `Editor.Root` and `mod+/` opens a Radix dialog listing every active binding, grouped by category (Edit, Selection, Movement, View) and rendered as `<kbd>` chips. The chips are platform-aware — `⌘` on macOS, `Ctrl` elsewhere.

```tsx
<Editor.Root>
    <Editor.Properties />
    <Editor.Toolbar />
    <Editor.Canvas><Editor.Section /></Editor.Canvas>
    <Editor.KeybindingHelp />
</Editor.Root>
```

If you customise the keymap via `Editor.Root` `keybindings`, pass the same partial map to `Editor.KeybindingHelp` so the chips match the active runtime:

```tsx
const myKeymap = { redo: 'mod+r' };

<Editor.Root keybindings={myKeymap}>
    <Editor.KeybindingHelp keymap={myKeymap} />
</Editor.Root>
```

The dialog also accepts a controlled `open` / `onOpenChange` pair so you can hook it up to a custom trigger (e.g. a "?" button in your toolbar). The `showHelp` listener is mounted by the dialog itself (not by the main `useEditorKeybindings` dispatcher), so the chord still works regardless of the `Editor.Root` `keybindings` prop — drop the dialog or skip rendering it entirely when you want the help layer off.

## Override individual bindings

Pass a `Partial<EditorKeymap>` — anything omitted keeps its default. Use an array of strings to register alternates:

```tsx
import { Editor } from '@docmosaic/react';

<Editor.Root
    keybindings={{
        redo: 'mod+r',
        deleteSection: ['Delete', 'Backspace', 'x'],
    }}
>
    {/* … */}
</Editor.Root>;
```

The matcher checks every binding for each action; first match wins. The shift-nudge variants (`nudgeUpLarge`, etc.) are matched before the plain arrow bindings so `Shift+ArrowUp` doesn't accidentally fire `nudgeUp`.

## Disable all shortcuts

Pass `false` to skip mounting the window listener entirely:

```tsx
<Editor.Root keybindings={false}>{/* … */}</Editor.Root>
```

Useful when your app already owns its own shortcut layer and you don't want two listeners fighting over the same events.

## Building a custom keymap

Every field on `EditorKeymap` is optional. Combine multiple actions in one map:

```tsx
import { Editor, type EditorKeymap } from '@docmosaic/react';

const myKeymap: Partial<EditorKeymap> = {
    undo: ['mod+z', 'mod+u'],
    redo: ['mod+shift+z', 'mod+y'],
    deselect: ['Escape', 'mod+d'],
    nudgeUpLarge: 'shift+ArrowUp',
};

<Editor.Root keybindings={myKeymap}>{/* … */}</Editor.Root>;
```

Token rules:

- Modifiers: `mod`, `shift`, `alt` (or `option`), `ctrl` (or `control`), `cmd`/`meta`/`command`.
- Non-modifier tokens are matched case-insensitively against `KeyboardEvent.key` — `'z'`, `'Escape'`, `'ArrowRight'`, `'Delete'`, `'Backspace'`.
- Tokens are joined with `+`: `'mod+shift+z'`.

## Standalone usage with `useEditorKeybindings`

The hook is exported separately for "BYO-UI" trees that mount their own provider (see the [Designer headless-mode walk-through](./designer.md#headless-mode)). Render it anywhere inside an `EditorProvider`:

```tsx
import { useEditorKeybindings, DEFAULT_KEYMAP } from '@docmosaic/react';

function MyShortcuts() {
    useEditorKeybindings({ redo: 'mod+r' });
    return null;
}

<Editor.Root>
    <MyShortcuts />
    <Editor.Properties />
    <Editor.Canvas>
        <Editor.Section />
    </Editor.Canvas>
</Editor.Root>;
```

`DEFAULT_KEYMAP` is exported too — useful when you want to spread the defaults into a derived keymap of your own.

## Best practices

- **Don't fight the browser.** `mod+t`, `mod+w`, `mod+r` and `mod+l` are common browser shortcuts; users react badly when an editor steals them.
- **Don't fight the OS.** `mod+Q`, `mod+H`, `mod+Tab` belong to the platform.
- **Stay inside the conventions.** `mod+z`/`mod+shift+z` for undo/redo. `Escape` for cancel. Arrows for nudge. Users have muscle memory — match it before inventing.
- **Register alternates rather than overriding.** Adding `'x'` to `deleteSection` keeps Delete and Backspace working — strictly safer than replacing them.

## See also

- [Designer](./designer.md) — selection model that nudge / delete operate on
- [Layers](./layers.md) — z-index actions that could be bound to shortcuts in the future
- [`@docmosaic/react` README — Keybindings](../../packages/react/README.md#keybindings)
- [`packages/react/src/hooks/use-editor-keybindings.ts`](../../packages/react/src/hooks/use-editor-keybindings.ts) — source with JSDoc on every action
