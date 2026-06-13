/**
 * Pure reducer for the DocMosaic document state.
 *
 * Mirrors the mutation surface of the legacy `useDocumentState` hook so that
 * the React layer can eventually delegate all document writes to this
 * framework-agnostic function. The reducer is intentionally pure: it never
 * mutates `state` or `action`, and it does not touch the clock — callers
 * pass `now` in the action payload where a timestamp is required.
 *
 * @packageDocumentation
 */

import { v4 as uuidv4 } from 'uuid';
import { createPage, createSection } from './factories';
import type {
    Document,
    PageBackground,
    PageGuides,
    PageOrientation,
    PageSize,
    Section,
    ShapeKind,
    Stroke,
} from './types';

/**
 * Document state managed by {@link reducer}. Alias for {@link Document} kept
 * separate so future state extensions don't ripple through type imports.
 */
export type State = Document;

/**
 * Discriminated union of every write action supported by {@link reducer}.
 *
 * @remarks
 * Action types use SCREAMING_SNAKE_CASE. Payloads are intentionally
 * minimal — for example, `ADD_SECTION` takes pixel coordinates which the
 * reducer feeds through {@link createSection} so the existing 96→72 DPI
 * conversion is preserved.
 *
 * Actions that bump `updatedAt` accept an optional `now` field so tests can
 * pin the clock; when omitted, `new Date()` is used.
 */
export type Action =
    | { type: 'UPDATE_DOCUMENT'; updates: Partial<Document>; now?: Date }
    | { type: 'UPDATE_NAME'; name: string; now?: Date }
    | { type: 'UPDATE_PAGE_SIZE'; pageSize: PageSize; now?: Date }
    | { type: 'UPDATE_ORIENTATION'; orientation: PageOrientation; now?: Date }
    | { type: 'UPDATE_ESTIMATED_SIZE'; size: number; now?: Date }
    | { type: 'CHANGE_PAGE'; pageNumber: number; now?: Date }
    | { type: 'ADD_PAGE'; now?: Date }
    | { type: 'DELETE_PAGE'; pageIndex: number; now?: Date }
    | { type: 'REORDER_PAGES'; fromIndex: number; toIndex: number; now?: Date }
    | {
          type: 'ADD_SECTION';
          x?: number;
          y?: number;
          /**
           * Variant to create. Defaults to `'image'` so legacy callers
           * (which never passed a type) keep producing image sections.
           */
          sectionType?: 'image' | 'text' | 'shape' | 'drawing' | 'frame';
          /**
           * Required when `sectionType === 'shape'`. Picks the primitive
           * (`'rect' | 'circle' | 'line'`). Ignored for other variants.
           */
          shape?: ShapeKind;
          now?: Date;
      }
    | { type: 'UPDATE_SECTION'; section: Section; now?: Date }
    | {
          type: 'UPDATE_PAGE_BACKGROUND';
          pageIndex: number;
          background: PageBackground | undefined;
          now?: Date;
      }
    | { type: 'DELETE_SECTION'; sectionId: string; now?: Date }
    | { type: 'DUPLICATE_SECTION'; section: Section; now?: Date }
    | { type: 'BRING_TO_FRONT'; sectionId: string; now?: Date }
    | { type: 'SEND_TO_BACK'; sectionId: string; now?: Date }
    | { type: 'MOVE_FORWARD'; sectionId: string; now?: Date }
    | { type: 'MOVE_BACKWARD'; sectionId: string; now?: Date }
    | { type: 'ADD_STROKE'; sectionId: string; stroke: Stroke; now?: Date }
    | { type: 'CLEAR_STROKES'; sectionId: string; now?: Date }
    | { type: 'TOGGLE_HIDDEN'; sectionId: string; now?: Date }
    | { type: 'TOGGLE_LOCKED'; sectionId: string; now?: Date }
    | { type: 'SET_HIDDEN'; sectionId: string; hidden: boolean; now?: Date }
    | { type: 'SET_LOCKED'; sectionId: string; locked: boolean; now?: Date }
    /**
     * Add a ruler-dragged guide line on a page. Duplicates (same axis +
     * position) are skipped so repeated drags onto the same value don't
     * grow the array.
     */
    | {
          type: 'ADD_GUIDE';
          pageIndex: number;
          axis: 'vertical' | 'horizontal';
          position: number;
          now?: Date;
      }
    /** Remove a previously-placed guide line. No-op when not found. */
    | {
          type: 'REMOVE_GUIDE';
          pageIndex: number;
          axis: 'vertical' | 'horizontal';
          position: number;
          now?: Date;
      };

function touch(state: State, now: Date | undefined): State {
    return { ...state, updatedAt: now ?? new Date() };
}

/**
 * Apply an {@link Action} to {@link State} and return a new state value.
 *
 * @remarks
 * Pure: `state` and `action` are never mutated and `new Date()` is only
 * read when the action omits `now`. Wrap with {@link withHistory} to gain
 * undo/redo on top of any of these actions.
 *
 * @param state - The current document state. Not mutated.
 * @param action - The action to apply.
 * @returns A new document state reflecting `action`.
 *
 * @example
 * ```ts
 * import { createDocument, reducer } from '@docmosaic/core';
 *
 * const initial = createDocument();
 * const renamed = reducer(initial, { type: 'UPDATE_NAME', name: 'Invoice' });
 * renamed.name; // 'Invoice'
 *
 * const withSection = reducer(renamed, { type: 'ADD_SECTION' });
 * withSection.sections.length; // 1
 * ```
 */
export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'UPDATE_DOCUMENT':
            return touch({ ...state, ...action.updates }, action.now);

        case 'UPDATE_NAME':
            return touch({ ...state, name: action.name }, action.now);

        case 'UPDATE_PAGE_SIZE':
            return touch({ ...state, pageSize: action.pageSize }, action.now);

        case 'UPDATE_ORIENTATION':
            return touch({ ...state, orientation: action.orientation }, action.now);

        case 'UPDATE_ESTIMATED_SIZE':
            return touch({ ...state, estimatedSize: action.size }, action.now);

        case 'CHANGE_PAGE':
            return touch({ ...state, currentPage: action.pageNumber }, action.now);

        case 'ADD_PAGE': {
            const nextTotal = state.totalPages + 1;
            return touch(
                {
                    ...state,
                    pages: [...state.pages, createPage()],
                    totalPages: nextTotal,
                    currentPage: nextTotal,
                },
                action.now,
            );
        }

        case 'DELETE_PAGE': {
            // Guard: refuse to delete the last remaining page.
            if (state.pages.length <= 1) {
                return state;
            }
            const { pageIndex } = action;
            const newPages = state.pages.filter((_, index) => index !== pageIndex);
            const adjustedSections = state.sections
                .filter((section) => section.page !== pageIndex + 1)
                .map((section) =>
                    section.page > pageIndex + 1 ? { ...section, page: section.page - 1 } : section,
                );
            return touch(
                {
                    ...state,
                    pages: newPages,
                    sections: adjustedSections,
                    totalPages: state.totalPages - 1,
                    currentPage: Math.min(state.currentPage, state.totalPages - 1),
                },
                action.now,
            );
        }

        case 'REORDER_PAGES': {
            const { fromIndex, toIndex } = action;
            const newPages = [...state.pages];
            const [moved] = newPages.splice(fromIndex, 1);
            newPages.splice(toIndex, 0, moved);

            const updatedSections = state.sections.map((section) => {
                if (section.page === fromIndex + 1) {
                    return { ...section, page: toIndex + 1 };
                }
                if (
                    fromIndex < toIndex &&
                    section.page > fromIndex + 1 &&
                    section.page <= toIndex + 1
                ) {
                    return { ...section, page: section.page - 1 };
                }
                if (
                    fromIndex > toIndex &&
                    section.page >= toIndex + 1 &&
                    section.page < fromIndex + 1
                ) {
                    return { ...section, page: section.page + 1 };
                }
                return section;
            });

            return touch(
                {
                    ...state,
                    pages: newPages,
                    sections: updatedSections,
                },
                action.now,
            );
        }

        case 'ADD_SECTION': {
            const newSection = createSection({
                type: action.sectionType ?? 'image',
                shape: action.shape,
                x: action.x ?? 5,
                y: action.y ?? 5,
                page: state.currentPage,
            });
            return touch(
                {
                    ...state,
                    sections: [...state.sections, newSection],
                },
                action.now,
            );
        }

        case 'UPDATE_PAGE_BACKGROUND': {
            const { pageIndex, background } = action;
            if (pageIndex < 0 || pageIndex >= state.pages.length) {
                return state;
            }
            const newPages = state.pages.map((page, idx) =>
                idx === pageIndex ? { ...page, background } : page,
            );
            return touch({ ...state, pages: newPages }, action.now);
        }

        case 'UPDATE_SECTION':
            return touch(
                {
                    ...state,
                    sections: state.sections.map((section) =>
                        section.id === action.section.id ? action.section : section,
                    ),
                },
                action.now,
            );

        case 'DELETE_SECTION':
            // Deleting a container frame fans out to its children: any section
            // whose `parentFrameId` points at the target is removed too, so a
            // frame and its contents leave the document as one undoable step.
            return touch(
                {
                    ...state,
                    sections: state.sections.filter(
                        (section) =>
                            section.id !== action.sectionId &&
                            section.parentFrameId !== action.sectionId,
                    ),
                },
                action.now,
            );

        case 'DUPLICATE_SECTION': {
            const source = action.section;
            const newId = uuidv4();
            const duplicated: Section = {
                ...source,
                id: newId,
                x: source.x + 20,
                y: source.y + 20,
            };
            // Duplicating a container frame also clones its children, re-pointing
            // them at the new frame and shifting by the same offset so the copied
            // group keeps its internal layout.
            const childClones: Section[] =
                source.type === 'frame'
                    ? state.sections
                          .filter((s) => s.parentFrameId === source.id)
                          .map((child) => ({
                              ...child,
                              id: uuidv4(),
                              x: child.x + 20,
                              y: child.y + 20,
                              parentFrameId: newId,
                          }))
                    : [];
            return touch(
                {
                    ...state,
                    sections: [...state.sections, duplicated, ...childClones],
                },
                action.now,
            );
        }

        case 'BRING_TO_FRONT': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            const pageSections = state.sections.filter((s) => s.page === target.page);
            const maxZ = pageSections.reduce((m, s) => (s.zIndex > m ? s.zIndex : m), -Infinity);
            if (target.zIndex === maxZ && pageSections.length === 1) return state;
            const nextZ = maxZ + 1;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, zIndex: nextZ } : s,
                    ),
                },
                action.now,
            );
        }

        case 'SEND_TO_BACK': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            const pageSections = state.sections.filter((s) => s.page === target.page);
            const minZ = pageSections.reduce((m, s) => (s.zIndex < m ? s.zIndex : m), Infinity);
            if (target.zIndex === minZ && pageSections.length === 1) return state;
            const nextZ = minZ - 1;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, zIndex: nextZ } : s,
                    ),
                },
                action.now,
            );
        }

        case 'MOVE_FORWARD': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            // Next-higher section on the same page: the smallest zIndex strictly
            // greater than target's. Ties resolved by array index so the swap is
            // deterministic when multiple peers share a zIndex.
            const higherPeers = state.sections.filter(
                (s) => s.page === target.page && s.id !== target.id && s.zIndex > target.zIndex,
            );
            if (higherPeers.length === 0) return state;
            const nextHigher = higherPeers.reduce((best, s) => (s.zIndex < best.zIndex ? s : best));
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) => {
                        if (s.id === target.id) return { ...s, zIndex: nextHigher.zIndex };
                        if (s.id === nextHigher.id) return { ...s, zIndex: target.zIndex };
                        return s;
                    }),
                },
                action.now,
            );
        }

        case 'MOVE_BACKWARD': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            const lowerPeers = state.sections.filter(
                (s) => s.page === target.page && s.id !== target.id && s.zIndex < target.zIndex,
            );
            if (lowerPeers.length === 0) return state;
            const nextLower = lowerPeers.reduce((best, s) => (s.zIndex > best.zIndex ? s : best));
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) => {
                        if (s.id === target.id) return { ...s, zIndex: nextLower.zIndex };
                        if (s.id === nextLower.id) return { ...s, zIndex: target.zIndex };
                        return s;
                    }),
                },
                action.now,
            );
        }

        case 'ADD_STROKE': {
            // Strokes are append-only during a drawing session. No-op when the
            // target id isn't a drawing section so a stray dispatch can't
            // corrupt an image/text/shape.
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target || target.type !== 'drawing') return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId && s.type === 'drawing'
                            ? { ...s, strokes: [...s.strokes, action.stroke] }
                            : s,
                    ),
                },
                action.now,
            );
        }

        case 'CLEAR_STROKES': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target || target.type !== 'drawing') return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId && s.type === 'drawing'
                            ? { ...s, strokes: [] }
                            : s,
                    ),
                },
                action.now,
            );
        }

        case 'TOGGLE_HIDDEN': {
            // No-op when the target id doesn't exist so a stray dispatch
            // can't fabricate a hidden flag on a phantom section.
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, hidden: !s.hidden } : s,
                    ),
                },
                action.now,
            );
        }

        case 'TOGGLE_LOCKED': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, locked: !s.locked } : s,
                    ),
                },
                action.now,
            );
        }

        case 'SET_HIDDEN': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, hidden: action.hidden } : s,
                    ),
                },
                action.now,
            );
        }

        case 'SET_LOCKED': {
            const target = state.sections.find((s) => s.id === action.sectionId);
            if (!target) return state;
            return touch(
                {
                    ...state,
                    sections: state.sections.map((s) =>
                        s.id === action.sectionId ? { ...s, locked: action.locked } : s,
                    ),
                },
                action.now,
            );
        }

        case 'ADD_GUIDE': {
            const { pageIndex, axis, position } = action;
            if (pageIndex < 0 || pageIndex >= state.pages.length) return state;
            const page = state.pages[pageIndex];
            const existing = page.guides ?? { vertical: [], horizontal: [] };
            // Skip exact duplicates so repeated drags onto the same value
            // don't bloat the page state. Callers that want a "thicker" guide
            // group should round positions before dispatching.
            if (existing[axis].includes(position)) return state;
            const nextGuides: PageGuides = {
                vertical:
                    axis === 'vertical' ? [...existing.vertical, position] : existing.vertical,
                horizontal:
                    axis === 'horizontal'
                        ? [...existing.horizontal, position]
                        : existing.horizontal,
            };
            const newPages = state.pages.map((p, idx) =>
                idx === pageIndex ? { ...p, guides: nextGuides } : p,
            );
            return touch({ ...state, pages: newPages }, action.now);
        }

        case 'REMOVE_GUIDE': {
            const { pageIndex, axis, position } = action;
            if (pageIndex < 0 || pageIndex >= state.pages.length) return state;
            const page = state.pages[pageIndex];
            if (!page.guides) return state;
            if (!page.guides[axis].includes(position)) return state;
            const nextGuides: PageGuides = {
                vertical:
                    axis === 'vertical'
                        ? page.guides.vertical.filter((v) => v !== position)
                        : page.guides.vertical,
                horizontal:
                    axis === 'horizontal'
                        ? page.guides.horizontal.filter((v) => v !== position)
                        : page.guides.horizontal,
            };
            const newPages = state.pages.map((p, idx) =>
                idx === pageIndex ? { ...p, guides: nextGuides } : p,
            );
            return touch({ ...state, pages: newPages }, action.now);
        }
    }
}
