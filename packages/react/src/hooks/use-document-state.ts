import {
    Action,
    HistoryState,
    ImageSection,
    PageOrientation,
    PageSize,
    PDFDocument,
    createDocument,
    createSection,
    reducer,
    withHistory,
} from '@docmosaic/core';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

const trackedReducer = withHistory<PDFDocument, Action>(reducer);

function init(): HistoryState<PDFDocument> {
    return { present: createDocument(), past: [], future: [] };
}

export function useDocumentState() {
    const [state, dispatch] = useReducer(trackedReducer, undefined, init);

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
            addSection: () => {
                const current = stateRef.current.present;
                const newSection = createSection(5, 5, current.currentPage);
                dispatch({
                    type: 'UPDATE_DOCUMENT',
                    updates: { sections: [...current.sections, newSection] },
                });
                return newSection;
            },
            updateSection: (section: ImageSection) =>
                dispatch({ type: 'UPDATE_SECTION', section }),
            deleteSection: (sectionId: string) =>
                dispatch({ type: 'DELETE_SECTION', sectionId }),
            duplicateSection: (section: ImageSection) =>
                dispatch({ type: 'DUPLICATE_SECTION', section }),
            addPage: () => dispatch({ type: 'ADD_PAGE' }),
            deletePage: (pageIndex: number) => {
                if (stateRef.current.present.pages.length <= 1) {
                    alert('Cannot delete the last page');
                    return;
                }
                dispatch({ type: 'DELETE_PAGE', pageIndex });
            },
            changePage: (pageNumber: number) =>
                dispatch({ type: 'CHANGE_PAGE', pageNumber }),
            updatePageSize: (pageSize: PageSize) =>
                dispatch({ type: 'UPDATE_PAGE_SIZE', pageSize }),
            updateOrientation: (orientation: PageOrientation) =>
                dispatch({ type: 'UPDATE_ORIENTATION', orientation }),
            updateName: (name: string) => dispatch({ type: 'UPDATE_NAME', name }),
            reorderPages: (fromIndex: number, toIndex: number) =>
                dispatch({ type: 'REORDER_PAGES', fromIndex, toIndex }),
            updateEstimatedSize: (size: number) =>
                dispatch({ type: 'UPDATE_ESTIMATED_SIZE', size }),
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
