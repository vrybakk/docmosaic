'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '../context/editor';
import {
    DEFAULT_KEYMAP,
    type EditorKeybinding,
    type EditorKeymap,
} from '../hooks/use-editor-keybindings';
import { cn } from '../internal/utils';
import { isMacPlatform } from '../internal/platform';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';

export interface KeybindingHelpProps {
    /**
     * Override the displayed keymap. Defaults to {@link DEFAULT_KEYMAP}. Pass
     * the same partial map you handed to `Editor.Root` `keybindings` so the
     * dialog reflects the actual active bindings.
     *
     * Anything omitted falls back to the default — the merge mirrors what the
     * runtime layer does.
     */
    keymap?: Partial<EditorKeymap>;
    /**
     * Externally control the open state. When omitted, the dialog manages its
     * own visibility and listens for the `showHelp` keybinding to toggle.
     */
    open?: boolean;
    /** Called when the user requests open/close. */
    onOpenChange?: (open: boolean) => void;
}

interface KeyGroup {
    label: string;
    rows: {
        action: keyof EditorKeymap;
        description: string;
        binding: EditorKeybinding | undefined;
    }[];
}

/**
 * Group the visible actions into logical sections, so users scan the dialog
 * the way they think about the editor: edit history, then selection, then
 * movement, then meta.
 */
function buildGroups(merged: Required<EditorKeymap>): KeyGroup[] {
    return [
        {
            label: 'Edit',
            rows: [
                { action: 'undo', description: 'Undo', binding: merged.undo },
                { action: 'redo', description: 'Redo', binding: merged.redo },
            ],
        },
        {
            label: 'Selection',
            rows: [
                {
                    action: 'deselect',
                    description: 'Clear selection',
                    binding: merged.deselect,
                },
                {
                    action: 'deleteSection',
                    description: 'Delete selected section',
                    binding: merged.deleteSection,
                },
            ],
        },
        {
            label: 'Movement',
            rows: [
                { action: 'nudgeUp', description: 'Nudge up (1pt)', binding: merged.nudgeUp },
                {
                    action: 'nudgeDown',
                    description: 'Nudge down (1pt)',
                    binding: merged.nudgeDown,
                },
                {
                    action: 'nudgeLeft',
                    description: 'Nudge left (1pt)',
                    binding: merged.nudgeLeft,
                },
                {
                    action: 'nudgeRight',
                    description: 'Nudge right (1pt)',
                    binding: merged.nudgeRight,
                },
                {
                    action: 'nudgeUpLarge',
                    description: 'Nudge up (10pt)',
                    binding: merged.nudgeUpLarge,
                },
                {
                    action: 'nudgeDownLarge',
                    description: 'Nudge down (10pt)',
                    binding: merged.nudgeDownLarge,
                },
                {
                    action: 'nudgeLeftLarge',
                    description: 'Nudge left (10pt)',
                    binding: merged.nudgeLeftLarge,
                },
                {
                    action: 'nudgeRightLarge',
                    description: 'Nudge right (10pt)',
                    binding: merged.nudgeRightLarge,
                },
            ],
        },
        {
            label: 'View',
            rows: [
                {
                    action: 'showHelp',
                    description: 'Show keyboard shortcuts',
                    binding: merged.showHelp,
                },
            ],
        },
    ];
}

/**
 * Render a single binding token (`'mod+z'`, `'shift+ArrowUp'`, etc.) as a
 * platform-aware set of `<kbd>` chips. Returns an empty array for unknown
 * bindings so the caller can decide what to render.
 */
function tokenize(binding: string, isMac: boolean): string[] {
    return binding
        .split('+')
        .map((t) => t.trim())
        .map((token) => {
            const lower = token.toLowerCase();
            if (lower === 'mod') return isMac ? '⌘' : 'Ctrl';
            if (lower === 'cmd' || lower === 'meta' || lower === 'command') return '⌘';
            if (lower === 'ctrl' || lower === 'control') return 'Ctrl';
            if (lower === 'shift') return isMac ? '⇧' : 'Shift';
            if (lower === 'alt' || lower === 'option') return isMac ? '⌥' : 'Alt';
            if (lower === 'arrowup') return '↑';
            if (lower === 'arrowdown') return '↓';
            if (lower === 'arrowleft') return '←';
            if (lower === 'arrowright') return '→';
            if (lower === 'escape') return 'Esc';
            // Single character keys read better uppercased.
            if (token.length === 1) return token.toUpperCase();
            return token;
        });
}

function bindingToTokens(binding: EditorKeybinding | undefined, isMac: boolean): string[][] {
    if (!binding) return [];
    const arr = Array.isArray(binding) ? binding : [binding];
    return arr.map((b) => tokenize(b, isMac));
}

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

/**
 * `Editor.KeybindingHelp` — Cmd+`/` (default) opens a Radix dialog listing
 * every active keybinding, grouped by category and rendered as `<kbd>` chips.
 *
 * The dialog must live inside an `Editor.Root` so it can read `readOnly` and
 * coordinate with the rest of the context, but it can be placed anywhere in
 * the tree. It mounts its own keydown listener for the `showHelp` chord — the
 * regular `useEditorKeybindings` dispatcher leaves `showHelp` alone since it
 * has no action side effect to run.
 *
 * Pass the same partial keymap you give to `Editor.Root` if you've customised
 * any bindings, so the displayed chips match the active runtime.
 *
 * @example
 * ```tsx
 * <Editor.Root>
 *   <Editor.Properties />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.KeybindingHelp />
 * </Editor.Root>
 * ```
 */
export function KeybindingHelp({
    keymap = {},
    open: openProp,
    onOpenChange,
}: KeybindingHelpProps = {}) {
    // Reading the editor context isn't strictly required for rendering, but it
    // enforces the "must live inside Editor.Root" contract — and matches every
    // other Editor.* primitive's behaviour.
    useEditor();

    const merged = useMemo<Required<EditorKeymap>>(
        () => ({ ...DEFAULT_KEYMAP, ...keymap }),
        [keymap],
    );
    const groups = useMemo(() => buildGroups(merged), [merged]);

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : internalOpen;

    const setOpen = (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
    };

    // Self-mount a listener for the `showHelp` binding. Skipped while focus
    // is in a text field, matching the rest of the keybindings layer.
    useEffect(() => {
        const isMac = isMacPlatform();
        const handler = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return;
            const binding = merged.showHelp;
            if (!binding) return;
            const variants = Array.isArray(binding) ? binding : [binding];
            for (const v of variants) {
                if (matchesBinding(e, v, isMac)) {
                    e.preventDefault();
                    setOpen(!open);
                    return;
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merged.showHelp, open]);

    const isMac = isMacPlatform();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="max-w-lg p-0 bg-card text-card-foreground"
                aria-describedby="keybinding-help-description"
            >
                <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
                    <DialogTitle>Keyboard shortcuts</DialogTitle>
                </DialogHeader>
                <div id="keybinding-help-description" className="sr-only">
                    A list of the keyboard shortcuts active in this editor, grouped by category.
                </div>
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                    {groups.map((group) => (
                        <section key={group.label} className="mb-5 last:mb-0">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                {group.label}
                            </h3>
                            <ul className="flex flex-col gap-1.5">
                                {group.rows.map((row) => {
                                    const variants = bindingToTokens(row.binding, isMac);
                                    return (
                                        <li
                                            key={row.action}
                                            className="flex items-center justify-between gap-4 py-1"
                                        >
                                            <span className="text-sm">{row.description}</span>
                                            <span className="flex flex-wrap items-center gap-1 justify-end">
                                                {variants.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        unbound
                                                    </span>
                                                ) : (
                                                    variants.map((tokens, vi) => (
                                                        <span
                                                            key={vi}
                                                            className="flex items-center gap-1"
                                                        >
                                                            {vi > 0 && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    or
                                                                </span>
                                                            )}
                                                            {tokens.map((token, ti) => (
                                                                <kbd
                                                                    key={ti}
                                                                    className={cn(
                                                                        'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded border border-border bg-muted text-muted-foreground text-xs font-mono',
                                                                    )}
                                                                >
                                                                    {token}
                                                                </kbd>
                                                            ))}
                                                        </span>
                                                    ))
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Cheap binding matcher used only by the help dialog's own listener. The
 * full {@link useEditorKeybindings} matcher already handles every modifier
 * combination — we replicate the relevant subset here so the dialog stays
 * self-contained and the regular dispatcher doesn't need a `showHelp`
 * action case (it has no side effect to run).
 */
function matchesBinding(e: KeyboardEvent, binding: string, isMac: boolean): boolean {
    const tokens = binding.split('+').map((t) => t.trim().toLowerCase());
    let key = '';
    let mod = false;
    let shift = false;
    let alt = false;
    let ctrl = false;
    let meta = false;
    for (const token of tokens) {
        if (token === 'mod') mod = true;
        else if (token === 'shift') shift = true;
        else if (token === 'alt' || token === 'option') alt = true;
        else if (token === 'ctrl' || token === 'control') ctrl = true;
        else if (token === 'cmd' || token === 'meta' || token === 'command') meta = true;
        else key = token;
    }
    if (e.key.toLowerCase() !== key) return false;
    const wantMeta = meta || (mod && isMac);
    const wantCtrl = ctrl || (mod && !isMac);
    if (wantMeta !== e.metaKey) return false;
    if (wantCtrl !== e.ctrlKey) return false;
    if (shift !== e.shiftKey) return false;
    if (alt !== e.altKey) return false;
    return true;
}
