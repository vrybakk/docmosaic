'use client';

import type { Section } from '@docmosaic/core';
import {
    Eye,
    EyeOff,
    GripVertical,
    Image as ImageIcon,
    Lock,
    PenLine,
    Shapes,
    Type,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { cn } from '../../internal/utils';

/** react-dnd item-type used for layer rows. Co-located here so the drag source
 *  and drop target use exactly the same string — drift between them silently
 *  breaks reorder. */
export const LAYER_ROW_DRAG_TYPE = 'docmosaic/layer-row';

/**
 * Item shape passed through react-dnd while a layer row is being dragged.
 * The list-level reorder handler reads `id` to identify the source row.
 */
export interface LayerRowDragItem {
    id: string;
    /** Zero-based position in the visible (z-desc) list at drag start. */
    index: number;
}

export interface LayerRowProps {
    section: Section;
    /** Display index in the visible (z-desc) list. */
    index: number;
    isSelected: boolean;
    /** When `true`, drag-reorder and the hide/lock toggles are suppressed. */
    readOnly: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onToggleHidden: () => void;
    onToggleLocked: () => void;
    /** Reorder callback fired when a row is dragged over another row's hover
     *  midpoint, mirroring the Pages primitive's behavior. */
    onMoveRow: (fromIndex: number, toIndex: number) => void;
    /** Commit a new layer name (empty string clears it back to the derived label). */
    onRename: (name: string) => void;
}

/**
 * Render an icon matching the section's `type`. Image/Text/Shape/Drawing map to
 * lucide icons; the icon is purely informational so we keep it small + neutral.
 */
function SectionTypeIcon({ section }: { section: Section }) {
    const className = 'h-3.5 w-3.5 text-foreground/60';
    if (section.type === 'text') return <Type className={className} aria-hidden />;
    if (section.type === 'shape') return <Shapes className={className} aria-hidden />;
    if (section.type === 'drawing') return <PenLine className={className} aria-hidden />;
    return <ImageIcon className={className} aria-hidden />;
}

/**
 * Tiny swatch summarising the section's visual content — image thumbnail,
 * solid color for shapes, ink color for drawings, or a neutral placeholder.
 * Mostly there so users can pick out "the orange rectangle" without clicking.
 */
function SectionSwatch({ section }: { section: Section }) {
    if (section.type === 'image' && section.imageUrl) {
        return (
            <img
                src={section.imageUrl}
                alt=""
                title="Image preview"
                className="h-6 w-6 rounded-sm object-cover border border-primary/15"
            />
        );
    }
    if (section.type === 'shape') {
        const bg = section.fill && section.fill !== 'transparent' ? section.fill : 'transparent';
        const border = section.stroke ?? '#000';
        return (
            <div
                className="h-6 w-6 rounded-sm"
                style={{
                    background: bg,
                    borderColor: border,
                    borderWidth: 1,
                    borderStyle: 'solid',
                }}
                title={`Fill ${bg === 'transparent' ? 'none' : bg} · stroke ${border}`}
                aria-hidden
            />
        );
    }
    if (section.type === 'drawing') {
        const ink = section.strokes[0]?.color ?? '#000';
        return (
            <div
                className="h-6 w-6 rounded-sm border border-primary/15"
                style={{ background: ink, opacity: 0.7 }}
                title={`Ink ${ink}`}
                aria-hidden
            />
        );
    }
    // Image without source / text section — neutral placeholder.
    return (
        <div
            className="h-6 w-6 rounded-sm border border-primary/15 bg-primary/5"
            title="No color preview"
            aria-hidden
        />
    );
}

/**
 * Derive a user-facing label for the section. Text sections show their first
 * line of text; everything else falls back to "Type N" where N is a 1-based
 * counter (matched by the caller passing `index`).
 */
function getSectionLabel(section: Section, index: number): string {
    if (section.name && section.name.trim()) return section.name;
    if (section.type === 'text') {
        const first = section.text.split('\n')[0]?.trim();
        if (first) return first.length > 28 ? `${first.slice(0, 28)}…` : first;
        return `Text ${index + 1}`;
    }
    if (section.type === 'shape') {
        const kind = section.shape.charAt(0).toUpperCase() + section.shape.slice(1);
        return `${kind} ${index + 1}`;
    }
    if (section.type === 'drawing') return `Drawing ${index + 1}`;
    return `Image ${index + 1}`;
}

/**
 * One row in {@link LayerList}. The drag handle is the only drag-source so
 * row clicks reliably hit the select handler — react-dnd's
 * `connectDragSource` is attached to the handle, while `connectDropTarget`
 * wraps the entire row so dropping anywhere along the row registers.
 *
 * Hide / lock buttons fire their own actions; we `stopPropagation` on the
 * click so the row's `onSelect` doesn't also flip the selection.
 *
 * @internal Public-facing exposure is `Editor.LayerList.Row` from the index.
 */
export function LayerRow({
    section,
    index,
    isSelected,
    readOnly,
    onSelect,
    onToggleHidden,
    onToggleLocked,
    onMoveRow,
    onRename,
}: LayerRowProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const beginRename = () => {
        if (readOnly) return;
        setDraft(section.name ?? '');
        setIsEditing(true);
    };
    const commitRename = () => {
        setIsEditing(false);
        onRename(draft.trim());
    };

    const [{ isDragging }, dragRef] = useDrag<LayerRowDragItem, unknown, { isDragging: boolean }>(
        () => ({
            type: LAYER_ROW_DRAG_TYPE,
            item: { id: section.id, index },
            collect: (monitor) => ({ isDragging: monitor.isDragging() }),
            canDrag: () => !readOnly,
        }),
        [section.id, index, readOnly],
    );

    const [{ isOver }, dropRef] = useDrop<LayerRowDragItem, unknown, { isOver: boolean }>(
        () => ({
            accept: LAYER_ROW_DRAG_TYPE,
            collect: (monitor) => ({ isOver: monitor.isOver() }),
            hover: (item, monitor) => {
                if (readOnly) return;
                if (item.index === index) return;
                const node = ref.current;
                if (!node) return;
                const rect = node.getBoundingClientRect();
                const middleY = (rect.bottom - rect.top) / 2;
                const offset = monitor.getClientOffset();
                if (!offset) return;
                const hoverY = offset.y - rect.top;
                // Dragging downwards: only fire once past the midpoint so the
                // row doesn't oscillate. Same idea for upwards.
                if (item.index < index && hoverY < middleY) return;
                if (item.index > index && hoverY > middleY) return;
                onMoveRow(item.index, index);
                // Mutate the dragged item so subsequent hover events see the
                // new index — react-dnd pattern.
                item.index = index;
            },
        }),
        [index, readOnly, onMoveRow],
    );

    const isHidden = section.hidden === true;
    const isLocked = section.locked === true;
    const label = getSectionLabel(section, index);

    // Combine drop + drag refs on the row. The drag handle gets its own
    // dragRef call to scope dragging to the handle alone.
    const attachRow = (node: HTMLDivElement | null) => {
        ref.current = node;
        (dropRef as unknown as (n: HTMLDivElement | null) => void)(node);
    };
    const attachHandle = (node: HTMLDivElement | null) => {
        (dragRef as unknown as (n: HTMLDivElement | null) => void)(node);
    };

    return (
        <div
            ref={attachRow}
            data-layer-row="true"
            data-section-id={section.id}
            data-selected={isSelected ? 'true' : 'false'}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Layer ${label}`}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(e as unknown as React.MouseEvent);
                }
            }}
            className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                'border border-transparent text-sm',
                'hover:bg-secondary',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isSelected && 'bg-secondary border-primary/30 text-foreground',
                isOver && 'ring-1 ring-primary',
                isDragging && 'opacity-40',
                isHidden && 'opacity-60',
            )}
        >
            <div
                ref={attachHandle}
                data-layer-drag-handle="true"
                aria-hidden
                className={cn(
                    'shrink-0 text-foreground/40',
                    readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
                )}
                // Stop click bubbling so grabbing the handle doesn't also fire
                // the row's select handler.
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <SectionTypeIcon section={section} />
            <SectionSwatch section={section} />
            {isEditing ? (
                <input
                    autoFocus
                    value={draft}
                    placeholder={label}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') commitRename();
                        else if (e.key === 'Escape') setIsEditing(false);
                    }}
                    onBlur={commitRename}
                    className={cn(
                        'flex-1 min-w-0 rounded-sm bg-background px-1 py-0 text-sm text-foreground',
                        'outline-none ring-1 ring-ring',
                    )}
                />
            ) : (
                <span
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        beginRename();
                    }}
                    title="Double-click to rename"
                    className={cn(
                        'flex-1 min-w-0 truncate text-foreground',
                        isHidden && 'line-through text-foreground/60',
                    )}
                >
                    {label}
                </span>
            )}
            {!readOnly && (
                <>
                    <button
                        type="button"
                        aria-label={isHidden ? 'Show layer' : 'Hide layer'}
                        aria-pressed={isHidden}
                        title={isHidden ? 'Show layer' : 'Hide layer'}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleHidden();
                        }}
                        className={cn(
                            'shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-sm',
                            'text-foreground/60 hover:text-foreground hover:bg-primary/10',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        )}
                    >
                        {isHidden ? (
                            <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                            <Eye className="h-3.5 w-3.5" />
                        )}
                    </button>
                    <button
                        type="button"
                        aria-label={isLocked ? 'Unlock layer' : 'Lock layer'}
                        aria-pressed={isLocked}
                        title={isLocked ? 'Unlock layer' : 'Lock layer'}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleLocked();
                        }}
                        className={cn(
                            'shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-sm',
                            'text-foreground/60 hover:text-foreground hover:bg-primary/10',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            isLocked && 'text-primary',
                        )}
                    >
                        <Lock className="h-3.5 w-3.5" />
                    </button>
                </>
            )}
        </div>
    );
}
