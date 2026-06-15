'use client';

import type { Section } from '@docmosaic/core';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import {
    ArrowDown,
    ArrowDownToLine,
    ArrowUp,
    ArrowUpToLine,
    Copy,
    Eye,
    EyeOff,
    Lock,
    LockOpen,
    SquareDashed,
    Trash2,
} from 'lucide-react';
import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ElementRef,
    type ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useEditor } from '../context/editor';
import {
    DEFAULT_KEYMAP,
    type EditorKeybinding,
    type EditorKeymap,
} from '../hooks/use-editor-keybindings';
import { cn } from '../internal/utils';
import { isMacPlatform } from '../internal/platform';

/**
 * In-memory clipboard for `Editor.ContextMenu` copy/paste. The menu stashes
 * the source section here on copy and reads it back on paste, then dispatches
 * `duplicateSection` so the paste re-uses the same insert geometry as the
 * existing duplicate path.
 *
 * Module-scoped (not React state) so the same clipboard survives between
 * separate ContextMenu mounts — copying inside one canvas, then pasting after
 * the menu re-opens, still works.
 */
let clipboardSection: Section | null = null;

export interface ContextMenuProps {
    /**
     * Children wrapped by the right-click trigger. Typically `Editor.Canvas`
     * (or the page surface inside a custom shell).
     */
    children: ReactNode;
    /**
     * Override the displayed shortcut chips. Defaults to {@link DEFAULT_KEYMAP}.
     * Pass the same partial map you handed to `Editor.Root` `keybindings` so
     * the inline shortcuts match the active runtime — the menu items
     * themselves dispatch through {@link useEditor} actions regardless.
     */
    keymap?: Partial<EditorKeymap>;
    /** Optional class applied to the trigger wrapper. */
    className?: string;
}

/**
 * Right-click context menu wrapper. Auto-discriminates between two menus
 * based on the right-click target:
 *
 * - **Section menu** (right-click landed inside `[data-section="true"]`):
 *   Copy, Duplicate, Delete · Bring to front, Send to back, Move forward,
 *   Move backward · Hide, Lock.
 * - **Canvas menu** (anywhere else): Paste, Select all sections, Deselect.
 *
 * The menu reads {@link useEditor} actions and dispatches through them so a
 * `readOnly` `Editor.Root` greys out every mutating item.
 *
 * @example Wrap the canvas
 * ```tsx
 * <Editor.Root>
 *   <Editor.Toolbar />
 *   <Editor.ContextMenu>
 *     <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   </Editor.ContextMenu>
 * </Editor.Root>
 * ```
 */
export function ContextMenu({ children, keymap = {}, className }: ContextMenuProps) {
    const { state, ui, actions, readOnly } = useEditor();

    const merged = useMemo<Required<EditorKeymap>>(
        () => ({ ...DEFAULT_KEYMAP, ...keymap }),
        [keymap],
    );

    const [target, setTarget] = useState<{ sectionId: string | null }>({ sectionId: null });
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const el = e.target as HTMLElement | null;
            const sectionEl = el?.closest('[data-section="true"]') as HTMLElement | null;
            const sectionId = sectionEl?.getAttribute('data-section-id') ?? null;
            setTarget({ sectionId });
            // If the right-click landed on a section that's not currently
            // selected, replace the selection so subsequent menu items have a
            // sensible selection target. Matches the convention from Figma /
            // VS Code's explorer right-click behaviour.
            if (sectionId && !ui.selectedSectionIds.has(sectionId)) {
                const section = state.sections.find((s) => s.id === sectionId);
                if (section && !section.locked) ui.setSelectedSectionId(sectionId);
            }
        },
        [state.sections, ui],
    );

    const targetSection = target.sectionId
        ? state.sections.find((s) => s.id === target.sectionId)
        : null;

    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger
                ref={triggerRef}
                onContextMenu={handleContextMenu}
                className={cn('contents', className)}
                asChild={false}
            >
                {children}
            </ContextMenuPrimitive.Trigger>
            <ContextMenuPrimitive.Portal>
                <ContextMenuPrimitive.Content
                    className={cn(
                        'z-50 min-w-[14rem] overflow-hidden rounded-md border border-border',
                        'bg-card text-card-foreground shadow-md',
                        'p-1',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    )}
                    data-context-menu="true"
                >
                    {targetSection
                        ? renderSectionItems({
                              section: targetSection,
                              keymap: merged,
                              readOnly,
                              actions,
                              ui,
                          })
                        : renderCanvasItems({
                              keymap: merged,
                              readOnly,
                              actions,
                              ui,
                              sectionIds: state.sections
                                  .filter((s) => s.page === state.currentPage)
                                  .map((s) => s.id),
                          })}
                </ContextMenuPrimitive.Content>
            </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
    );
}

interface RenderSectionItemsArgs {
    section: Section;
    keymap: Required<EditorKeymap>;
    readOnly: boolean;
    actions: ReturnType<typeof useEditor>['actions'];
    ui: ReturnType<typeof useEditor>['ui'];
}

function renderSectionItems({
    section,
    keymap,
    readOnly,
    actions,
    ui,
}: RenderSectionItemsArgs): ReactNode {
    const items: ReactNode[] = [];

    items.push(
        <Item
            key="copy"
            icon={<Copy className="h-3.5 w-3.5" />}
            onSelect={() => {
                clipboardSection = section;
            }}
            data-context-menu-item="copy"
        >
            Copy
        </Item>,
        <Item
            key="duplicate"
            icon={<Copy className="h-3.5 w-3.5" />}
            disabled={readOnly}
            onSelect={() => actions.duplicateSection(section)}
            data-context-menu-item="duplicate"
        >
            Duplicate
        </Item>,
        <Item
            key="delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            disabled={readOnly}
            destructive
            onSelect={() => {
                actions.deleteSection(section.id);
                ui.clearSelection();
            }}
            shortcut={firstBinding(keymap.deleteSection)}
            data-context-menu-item="delete"
        >
            Delete
        </Item>,
    );

    items.push(<Separator key="sep-z" />);

    items.push(
        <Item
            key="bring-to-front"
            icon={<ArrowUpToLine className="h-3.5 w-3.5" />}
            disabled={readOnly}
            onSelect={() => actions.bringToFront(section.id)}
            data-context-menu-item="bring-to-front"
        >
            Bring to front
        </Item>,
        <Item
            key="send-to-back"
            icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
            disabled={readOnly}
            onSelect={() => actions.sendToBack(section.id)}
            data-context-menu-item="send-to-back"
        >
            Send to back
        </Item>,
        <Item
            key="move-forward"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            disabled={readOnly}
            onSelect={() => actions.moveForward(section.id)}
            data-context-menu-item="move-forward"
        >
            Move forward
        </Item>,
        <Item
            key="move-backward"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            disabled={readOnly}
            onSelect={() => actions.moveBackward(section.id)}
            data-context-menu-item="move-backward"
        >
            Move backward
        </Item>,
    );

    items.push(<Separator key="sep-vis" />);

    items.push(
        <Item
            key="toggle-hidden"
            icon={
                section.hidden ? (
                    <Eye className="h-3.5 w-3.5" />
                ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                )
            }
            disabled={readOnly}
            onSelect={() => actions.toggleHidden(section.id)}
            data-context-menu-item="toggle-hidden"
        >
            {section.hidden ? 'Show' : 'Hide'}
        </Item>,
        <Item
            key="toggle-locked"
            icon={
                section.locked ? (
                    <LockOpen className="h-3.5 w-3.5" />
                ) : (
                    <Lock className="h-3.5 w-3.5" />
                )
            }
            disabled={readOnly}
            onSelect={() => actions.toggleLocked(section.id)}
            data-context-menu-item="toggle-locked"
        >
            {section.locked ? 'Unlock' : 'Lock'}
        </Item>,
    );

    return items;
}

interface RenderCanvasItemsArgs {
    keymap: Required<EditorKeymap>;
    readOnly: boolean;
    actions: ReturnType<typeof useEditor>['actions'];
    ui: ReturnType<typeof useEditor>['ui'];
    sectionIds: string[];
}

function renderCanvasItems({
    keymap,
    readOnly,
    actions,
    ui,
    sectionIds,
}: RenderCanvasItemsArgs): ReactNode {
    return [
        <Item
            key="paste"
            icon={<Copy className="h-3.5 w-3.5" />}
            disabled={readOnly || !clipboardSection}
            onSelect={() => {
                if (!clipboardSection) return;
                actions.duplicateSection(clipboardSection);
            }}
            data-context-menu-item="paste"
        >
            Paste
        </Item>,
        <Separator key="sep-canvas" />,
        <Item
            key="select-all"
            icon={<SquareDashed className="h-3.5 w-3.5" />}
            onSelect={() => ui.selectMany(sectionIds)}
            disabled={sectionIds.length === 0}
            data-context-menu-item="select-all"
        >
            Select all
        </Item>,
        <Item
            key="deselect"
            icon={<SquareDashed className="h-3.5 w-3.5" />}
            onSelect={() => ui.clearSelection()}
            disabled={ui.selectedSectionIds.size === 0}
            shortcut={firstBinding(keymap.deselect)}
            data-context-menu-item="deselect"
        >
            Deselect
        </Item>,
    ];
}

interface ItemProps
    extends Omit<ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>, 'children'> {
    icon?: ReactNode;
    shortcut?: string | undefined;
    destructive?: boolean;
    children: ReactNode;
}

const Item = forwardRef<ElementRef<typeof ContextMenuPrimitive.Item>, ItemProps>(
    ({ className, icon, shortcut, destructive, children, ...props }, ref) => (
        <ContextMenuPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center gap-2',
                'rounded-sm px-2 py-1.5 text-sm outline-none',
                'focus:bg-muted focus:text-foreground',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                destructive && 'text-destructive focus:text-destructive',
                className,
            )}
            {...props}
        >
            {icon ? <span className="text-muted-foreground">{icon}</span> : null}
            <span className="flex-1">{children}</span>
            {shortcut ? (
                <span className="ml-auto text-xs tracking-wide text-muted-foreground">
                    {shortcut}
                </span>
            ) : null}
        </ContextMenuPrimitive.Item>
    ),
);
Item.displayName = 'EditorContextMenuItem';

function Separator() {
    return <ContextMenuPrimitive.Separator className="my-1 h-px bg-border" />;
}

/**
 * Pick the first string from a binding (drops alternates) and render the
 * platform-aware glyphs. Matches the chip style used in
 * `Editor.KeybindingHelp` but renders inline as a single muted text span.
 */
function firstBinding(binding: EditorKeybinding | undefined): string | undefined {
    if (!binding) return undefined;
    const first = Array.isArray(binding) ? binding[0] : binding;
    if (!first) return undefined;
    const isMac = isMacPlatform();
    return first
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
            if (token.length === 1) return token.toUpperCase();
            return token;
        })
        .join(isMac ? '' : '+');
}

/** @internal — exposed for tests so they can reset clipboard between cases. */
export function __resetContextMenuClipboard() {
    clipboardSection = null;
}
