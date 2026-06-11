import {
    Action,
    Document,
    HistoryState,
    PageBackground,
    PageOrientation,
    PageSize,
    Section,
    Stroke,
    createDocument,
    createSection,
    reducer,
    withHistory,
} from '@docmosaic/core';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

const trackedReducer = withHistory<Document, Action>(reducer);

function init(seed: Document | undefined): HistoryState<Document> {
    return { present: seed ?? createDocument(), past: [], future: [] };
}

interface UseDocumentStateArgs {
    /**
     * Optional seed document. Only read once (initial mount); subsequent
     * changes to this prop are ignored. Pass a new key on the parent to force
     * a remount if you need to swap documents.
     */
    initialDocument?: Document;
}

/**
 * Headless document-state hook. Owns a reducer + history timeline over the
 * editor document. Returned `actions` are stable; the document and
 * undo/redo flags re-render through React on every change.
 *
 * Exposed as a standalone export from `@docmosaic/react` so consumers who
 * want to drive their own UI ("BYO-UI") can reuse the same state machine
 * without going through `Editor.Root`. Pair this with a custom provider if
 * you want to feed the same shape into a different visual tree.
 *
 * @param args - Optional initial document seed (read once on mount).
 * @returns An object with:
 * - `document` — current {@link Document} state (the reducer's `present`).
 * - `formattedDate` — locale-formatted `updatedAt` string (empty on SSR).
 * - `canUndo` / `canRedo` — booleans driven by the history timeline.
 * - `actions` — stable 18-action surface mirroring {@link EditorActions}
 *   (`undo`, `redo`, `addSection`, `updateSection`, `deleteSection`,
 *   `duplicateSection`, `addPage`, `deletePage`, `changePage`,
 *   `updatePageSize`, `updateOrientation`, `updateName`, `reorderPages`,
 *   `updateEstimatedSize`, `bringToFront`, `sendToBack`, `moveForward`,
 *   `moveBackward`).
 *
 * @example
 * ```tsx
 * import { createDocument } from '@docmosaic/core';
 * import { useDocumentState } from '@docmosaic/react';
 *
 * function CustomEditor() {
 *   const { document, canUndo, actions } = useDocumentState({
 *     initialDocument: createDocument(),
 *   });
 *
 *   return (
 *     <>
 *       <button disabled={!canUndo} onClick={actions.undo}>Undo</button>
 *       <button onClick={actions.addSection}>Add section</button>
 *       <p>{document.name} — {document.sections.length} sections</p>
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link useEditor} for the in-`Editor.Root` equivalent.
 */
export function useDocumentState(args: UseDocumentStateArgs = {}) {
    const [state, dispatch] = useReducer(trackedReducer, args.initialDocument, init);

    const document = state.present;

    // Keep a ref so dispatch wrappers that need to read the latest document
    // (e.g. `addSection` returns the freshly created section) stay accurate
    // without rebuilding the `actions` object on every state change.
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const [formattedDate, setFormattedDate] = useState('');
    useEffect(() => {
        setFormattedDate(
            document.updatedAt.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        );
    }, [document.updatedAt]);

    const actions = useMemo(
        () => ({
            undo: () => dispatch({ type: 'UNDO' }),
            redo: () => dispatch({ type: 'REDO' }),
            addSection: (opts?: {
                type?: 'image' | 'text' | 'shape' | 'drawing';
                shape?: 'rect' | 'circle' | 'line';
            }) => {
                const current = stateRef.current.present;
                const newSection = createSection({
                    type: opts?.type ?? 'image',
                    shape: opts?.shape,
                    x: 5,
                    y: 5,
                    page: current.currentPage,
                });
                dispatch({
                    type: 'UPDATE_DOCUMENT',
                    updates: { sections: [...current.sections, newSection] },
                });
                return newSection;
            },
            addStroke: (sectionId: string, stroke: Stroke) =>
                dispatch({ type: 'ADD_STROKE', sectionId, stroke }),
            clearStrokes: (sectionId: string) => dispatch({ type: 'CLEAR_STROKES', sectionId }),
            updateSection: (section: Section) => dispatch({ type: 'UPDATE_SECTION', section }),
            deleteSection: (sectionId: string) => dispatch({ type: 'DELETE_SECTION', sectionId }),
            duplicateSection: (section: Section) =>
                dispatch({ type: 'DUPLICATE_SECTION', section }),
            addPage: () => dispatch({ type: 'ADD_PAGE' }),
            deletePage: (pageIndex: number) => {
                if (stateRef.current.present.pages.length <= 1) {
                    alert('Cannot delete the last page');
                    return;
                }
                dispatch({ type: 'DELETE_PAGE', pageIndex });
            },
            changePage: (pageNumber: number) => dispatch({ type: 'CHANGE_PAGE', pageNumber }),
            updatePageSize: (pageSize: PageSize) =>
                dispatch({ type: 'UPDATE_PAGE_SIZE', pageSize }),
            updateOrientation: (orientation: PageOrientation) =>
                dispatch({ type: 'UPDATE_ORIENTATION', orientation }),
            updateName: (name: string) => dispatch({ type: 'UPDATE_NAME', name }),
            reorderPages: (fromIndex: number, toIndex: number) =>
                dispatch({ type: 'REORDER_PAGES', fromIndex, toIndex }),
            updateEstimatedSize: (size: number) =>
                dispatch({ type: 'UPDATE_ESTIMATED_SIZE', size }),
            setPageBackground: (pageIndex: number, background: PageBackground | undefined) =>
                dispatch({ type: 'UPDATE_PAGE_BACKGROUND', pageIndex, background }),
            bringToFront: (sectionId: string) => dispatch({ type: 'BRING_TO_FRONT', sectionId }),
            sendToBack: (sectionId: string) => dispatch({ type: 'SEND_TO_BACK', sectionId }),
            moveForward: (sectionId: string) => dispatch({ type: 'MOVE_FORWARD', sectionId }),
            moveBackward: (sectionId: string) => dispatch({ type: 'MOVE_BACKWARD', sectionId }),
            toggleHidden: (sectionId: string) => dispatch({ type: 'TOGGLE_HIDDEN', sectionId }),
            toggleLocked: (sectionId: string) => dispatch({ type: 'TOGGLE_LOCKED', sectionId }),
            setHidden: (sectionId: string, hidden: boolean) =>
                dispatch({ type: 'SET_HIDDEN', sectionId, hidden }),
            setLocked: (sectionId: string, locked: boolean) =>
                dispatch({ type: 'SET_LOCKED', sectionId, locked }),
            loadDocument: (next: Document) => dispatch({ type: 'UPDATE_DOCUMENT', updates: next }),
            addGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) =>
                dispatch({ type: 'ADD_GUIDE', pageIndex, axis, position }),
            removeGuide: (pageIndex: number, axis: 'vertical' | 'horizontal', position: number) =>
                dispatch({ type: 'REMOVE_GUIDE', pageIndex, axis, position }),
        }),
        [],
    );

    return {
        document,
        formattedDate,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        actions,
    };
}
