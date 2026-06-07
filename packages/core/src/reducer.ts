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

import { createPage, createSection } from './factories';
import type { Document, PageOrientation, PageSize, Section } from './types';

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
    | { type: 'ADD_SECTION'; x?: number; y?: number; now?: Date }
    | { type: 'UPDATE_SECTION'; section: Section; now?: Date }
    | { type: 'DELETE_SECTION'; sectionId: string; now?: Date }
    | { type: 'DUPLICATE_SECTION'; section: Section; now?: Date }
    | { type: 'BRING_TO_FRONT'; sectionId: string; now?: Date }
    | { type: 'SEND_TO_BACK'; sectionId: string; now?: Date }
    | { type: 'MOVE_FORWARD'; sectionId: string; now?: Date }
    | { type: 'MOVE_BACKWARD'; sectionId: string; now?: Date };

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
                    section.page > pageIndex + 1
                        ? { ...section, page: section.page - 1 }
                        : section,
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
            const newSection = createSection(action.x ?? 5, action.y ?? 5, state.currentPage);
            return touch(
                {
                    ...state,
                    sections: [...state.sections, newSection],
                },
                action.now,
            );
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
            return touch(
                {
                    ...state,
                    sections: state.sections.filter((section) => section.id !== action.sectionId),
                },
                action.now,
            );

        case 'DUPLICATE_SECTION': {
            const source = action.section;
            const clone = createSection(0, 0, source.page);
            const duplicated: Section = {
                ...source,
                id: clone.id,
                x: source.x + 20,
                y: source.y + 20,
            };
            return touch(
                {
                    ...state,
                    sections: [...state.sections, duplicated],
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
            const nextHigher = higherPeers.reduce((best, s) =>
                s.zIndex < best.zIndex ? s : best,
            );
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
            const nextLower = lowerPeers.reduce((best, s) =>
                s.zIndex > best.zIndex ? s : best,
            );
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
    }
}
