'use client';

/**
 * @packageDocumentation
 *
 * Editor keybindings — an injectable, override-friendly keyboard shortcut layer
 * for `Editor.Root`. Defaults match common editor conventions (Cmd/Ctrl+Z for
 * undo, arrows to nudge a selected section, Delete to remove, Escape to
 * deselect). Consumers can pass a partial `keymap` to `Editor.Root` to override
 * individual bindings, supply alternates as an array, or disable the layer
 * entirely.
 */

import { useEffect } from 'react';
import { useEditor } from '../context/editor';
import { isMacPlatform } from '../internal/platform';

/**
 * A single keybinding string (e.g. `'mod+z'`) or an array of strings any of
 * which trigger the action (e.g. `['delete', 'backspace']`).
 *
 * Tokens are case-insensitive, joined with `+`, and use these modifier names:
 *
 * - `mod` — Cmd on macOS, Ctrl elsewhere. Prefer this over hard-coding `ctrl`
 *   or `cmd` so the binding feels native on both platforms.
 * - `shift`, `alt`, `ctrl`, `meta` — literal modifiers.
 *
 * Non-modifier tokens are matched against `KeyboardEvent.key`
 * (case-insensitive). Examples: `'z'`, `'Escape'`, `'ArrowRight'`, `'Delete'`,
 * `'Backspace'`.
 */
export type EditorKeybinding = string | string[];

/**
 * Map of editor actions to the keybinding(s) that trigger them. All fields are
 * optional — anything omitted falls back to {@link DEFAULT_KEYMAP}.
 *
 * The "Large" nudge variants are fired alongside `nudge*` when Shift is held;
 * the matcher prefers the most specific binding, so the default
 * `Shift+ArrowRight` triggers `nudgeRightLarge` rather than `nudgeRight`.
 */
export interface EditorKeymap {
    /** Undo the last document change. */
    undo?: EditorKeybinding;
    /** Redo a previously undone change. */
    redo?: EditorKeybinding;
    /** Delete the currently selected section (no-op if none selected). */
    deleteSection?: EditorKeybinding;
    /** Clear the current selection. */
    deselect?: EditorKeybinding;
    /** Nudge the selected section up by 1pt. */
    nudgeUp?: EditorKeybinding;
    /** Nudge the selected section down by 1pt. */
    nudgeDown?: EditorKeybinding;
    /** Nudge the selected section left by 1pt. */
    nudgeLeft?: EditorKeybinding;
    /** Nudge the selected section right by 1pt. */
    nudgeRight?: EditorKeybinding;
    /** Nudge the selected section up by 10pt. */
    nudgeUpLarge?: EditorKeybinding;
    /** Nudge the selected section down by 10pt. */
    nudgeDownLarge?: EditorKeybinding;
    /** Nudge the selected section left by 10pt. */
    nudgeLeftLarge?: EditorKeybinding;
    /** Nudge the selected section right by 10pt. */
    nudgeRightLarge?: EditorKeybinding;
    /**
     * Toggle the {@link Editor.KeybindingHelp} dialog. Defaults to `mod+/` —
     * the same chord used by Notion, GitHub, Slack, and most other web apps
     * with a built-in keymap viewer. Read-only safe (the dialog is a passive
     * viewer).
     */
    showHelp?: EditorKeybinding;
}

/**
 * Default keybindings used when nothing is provided. Matches the conventions
 * established by Figma, Notion, and other doc-editing tools.
 *
 * ```text
 * mod+z              undo
 * mod+shift+z, mod+y redo
 * Delete, Backspace  delete selected section
 * Escape             deselect
 * ArrowUp/Down/      nudge selected section by 1pt
 *   Left/Right
 * Shift+Arrow        nudge by 10pt
 * ```
 */
export const DEFAULT_KEYMAP: Required<EditorKeymap> = {
    undo: 'mod+z',
    redo: ['mod+shift+z', 'mod+y'],
    deleteSection: ['Delete', 'Backspace'],
    deselect: 'Escape',
    nudgeUp: 'ArrowUp',
    nudgeDown: 'ArrowDown',
    nudgeLeft: 'ArrowLeft',
    nudgeRight: 'ArrowRight',
    nudgeUpLarge: 'shift+ArrowUp',
    nudgeDownLarge: 'shift+ArrowDown',
    nudgeLeftLarge: 'shift+ArrowLeft',
    nudgeRightLarge: 'shift+ArrowRight',
    showHelp: 'mod+/',
};

const ACTIONS: ReadonlyArray<keyof EditorKeymap> = [
    'undo',
    'redo',
    'deleteSection',
    'deselect',
    'nudgeUpLarge',
    'nudgeDownLarge',
    'nudgeLeftLarge',
    'nudgeRightLarge',
    'nudgeUp',
    'nudgeDown',
    'nudgeLeft',
    'nudgeRight',
];

interface ParsedBinding {
    key: string;
    mod: boolean;
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
}

function parseBinding(binding: string): ParsedBinding {
    const tokens = binding.split('+').map((t) => t.trim().toLowerCase());
    const out: ParsedBinding = {
        key: '',
        mod: false,
        shift: false,
        alt: false,
        ctrl: false,
        meta: false,
    };
    for (const token of tokens) {
        if (token === 'mod') out.mod = true;
        else if (token === 'shift') out.shift = true;
        else if (token === 'alt' || token === 'option') out.alt = true;
        else if (token === 'ctrl' || token === 'control') out.ctrl = true;
        else if (token === 'cmd' || token === 'meta' || token === 'command') out.meta = true;
        else out.key = token;
    }
    return out;
}

function eventMatchesBinding(e: KeyboardEvent, parsed: ParsedBinding, isMac: boolean): boolean {
    if (e.key.toLowerCase() !== parsed.key.toLowerCase()) return false;

    // `mod` means Cmd on macOS, Ctrl elsewhere. Either map to the right native
    // modifier, then validate that no extra `ctrl`/`meta` is required beyond it.
    const wantMeta = parsed.meta || (parsed.mod && isMac);
    const wantCtrl = parsed.ctrl || (parsed.mod && !isMac);

    if (wantMeta !== e.metaKey) return false;
    if (wantCtrl !== e.ctrlKey) return false;
    if (parsed.shift !== e.shiftKey) return false;
    if (parsed.alt !== e.altKey) return false;

    return true;
}

function asArray(binding: EditorKeybinding): string[] {
    return Array.isArray(binding) ? binding : [binding];
}

function bindingMatches(
    e: KeyboardEvent,
    binding: EditorKeybinding | undefined,
    isMac: boolean,
): boolean {
    if (!binding) return false;
    return asArray(binding).some((s) => eventMatchesBinding(e, parseBinding(s), isMac));
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

/**
 * Attach a keydown listener that dispatches editor actions according to
 * `keymap` (merged over {@link DEFAULT_KEYMAP}). Used by `Editor.Root` when its
 * `keybindings` prop is anything other than `false`.
 *
 * The listener is mounted on `window` and skipped while the focused element is
 * an `<input>`, `<textarea>`, `<select>`, or anything `contenteditable` — that
 * keeps text fields (the document-name input, custom toolbar fields) typeable
 * without swallowing Delete/Escape.
 *
 * @param keymap - Partial override map. Any field omitted falls back to the
 *   default binding. Pass an array of strings to register alternates.
 * @returns Nothing — the hook is fire-and-forget; cleanup is automatic on
 *   unmount.
 *
 * @example
 * ```tsx
 * function MyEditor() {
 *   useEditorKeybindings({ redo: 'mod+r' });
 *   return null;
 * }
 *
 * <Editor.Root>
 *   <MyEditor />
 *   <Editor.Properties />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 * </Editor.Root>
 * ```
 *
 * @see {@link DEFAULT_KEYMAP} for the baseline bindings.
 * @see {@link EditorKeymap} for the full action surface.
 */
export function useEditorKeybindings(keymap: Partial<EditorKeymap> = {}): void {
    const editor = useEditor();

    useEffect(() => {
        const merged: Required<EditorKeymap> = { ...DEFAULT_KEYMAP, ...keymap };
        const isMac = isMacPlatform();

        const handler = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return;

            // Iterate the explicit ACTIONS order so the more specific
            // shift-nudge variants get a chance to match before the plain
            // arrow bindings.
            for (const action of ACTIONS) {
                if (!bindingMatches(e, merged[action], isMac)) continue;
                const handled = dispatchAction(action, editor);
                if (handled) e.preventDefault();
                return;
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [editor, keymap]);
}

/**
 * Apply the named action to the editor. Returns whether anything happened so
 * the caller can decide whether to call `preventDefault()` — we don't want to
 * eat ArrowRight while no section is selected.
 */
function dispatchAction(action: keyof EditorKeymap, editor: ReturnType<typeof useEditor>): boolean {
    const { state, actions, ui, canUndo, canRedo, readOnly } = editor;
    const selectedIds = ui.selectedSectionIds;

    // In read-only mode, only the deselect binding survives — everything
    // else mutates the document and would defeat the read-only contract.
    if (readOnly && action !== 'deselect') return false;

    switch (action) {
        case 'undo':
            if (!canUndo) return false;
            actions.undo();
            return true;
        case 'redo':
            if (!canRedo) return false;
            actions.redo();
            return true;
        case 'deleteSection':
            if (selectedIds.size === 0) return false;
            // Delete every selected section, not just the head of the set —
            // Phase 16 made selection multi.
            for (const id of selectedIds) actions.deleteSection(id);
            ui.clearSelection();
            return true;
        case 'deselect':
            if (selectedIds.size === 0) return false;
            ui.clearSelection();
            return true;
        case 'nudgeUp':
            return nudgeAll(state.sections, selectedIds, 0, -1, actions.updateSection);
        case 'nudgeDown':
            return nudgeAll(state.sections, selectedIds, 0, 1, actions.updateSection);
        case 'nudgeLeft':
            return nudgeAll(state.sections, selectedIds, -1, 0, actions.updateSection);
        case 'nudgeRight':
            return nudgeAll(state.sections, selectedIds, 1, 0, actions.updateSection);
        case 'nudgeUpLarge':
            return nudgeAll(state.sections, selectedIds, 0, -10, actions.updateSection);
        case 'nudgeDownLarge':
            return nudgeAll(state.sections, selectedIds, 0, 10, actions.updateSection);
        case 'nudgeLeftLarge':
            return nudgeAll(state.sections, selectedIds, -10, 0, actions.updateSection);
        case 'nudgeRightLarge':
            return nudgeAll(state.sections, selectedIds, 10, 0, actions.updateSection);
        case 'showHelp':
            // The dialog mounts its own listener so it can manage `open` state
            // locally — the main dispatcher has no action to run here. Leave
            // the event unhandled so the dialog's listener still fires.
            return false;
    }
}

function nudgeAll(
    sections: ReadonlyArray<ReturnType<typeof useEditor>['state']['sections'][number]>,
    selectedIds: ReadonlySet<string>,
    dx: number,
    dy: number,
    updateSection: ReturnType<typeof useEditor>['actions']['updateSection'],
): boolean {
    if (selectedIds.size === 0) return false;
    let touched = false;
    for (const s of sections) {
        if (!selectedIds.has(s.id)) continue;
        updateSection({ ...s, x: s.x + dx, y: s.y + dy });
        touched = true;
    }
    return touched;
}
