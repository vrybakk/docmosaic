/**
 * Higher-order reducer that adds undo/redo to any pure reducer.
 *
 * @packageDocumentation
 */

/**
 * Snapshot timeline wrapping a reducer's state.
 *
 * @typeParam S - The underlying reducer state type.
 */
export interface HistoryState<S> {
    present: S;
    past: S[];
    future: S[];
}

/**
 * Sentinel actions consumed by {@link withHistory} to navigate the timeline.
 * Any other action shape is forwarded to the wrapped reducer.
 */
export type HistoryAction = { type: 'UNDO' } | { type: 'REDO' };

/**
 * Wrap a pure reducer with snapshot-based undo/redo.
 *
 * On any non-`UNDO`/`REDO` action the wrapped reducer runs; the previous
 * `present` is pushed onto `past` and `future` is cleared. `UNDO` moves the
 * top of `past` into `present`, pushing the previous `present` onto `future`.
 * `REDO` does the inverse.
 *
 * @typeParam S - The wrapped reducer's state.
 * @typeParam A - The wrapped reducer's action.
 * @param reducer - Pure state reducer to wrap.
 * @returns A reducer over {@link HistoryState} that also handles `UNDO`/`REDO`.
 *
 * @example
 * ```ts
 * const counter = (n: number, a: { type: 'INC' }) => n + 1;
 * const tracked = withHistory(counter);
 *
 * let state: HistoryState<number> = { present: 0, past: [], future: [] };
 * state = tracked(state, { type: 'INC' });   // present = 1
 * state = tracked(state, { type: 'INC' });   // present = 2
 * state = tracked(state, { type: 'UNDO' });  // present = 1
 * state = tracked(state, { type: 'REDO' });  // present = 2
 * ```
 */
export function withHistory<S, A>(
    reducer: (state: S, action: A) => S,
): (state: HistoryState<S>, action: A | HistoryAction) => HistoryState<S> {
    return (state, action) => {
        if ((action as HistoryAction).type === 'UNDO') {
            if (state.past.length === 0) return state;
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, -1);
            return {
                present: previous,
                past: newPast,
                future: [state.present, ...state.future],
            };
        }

        if ((action as HistoryAction).type === 'REDO') {
            if (state.future.length === 0) return state;
            const [next, ...rest] = state.future;
            return {
                present: next,
                past: [...state.past, state.present],
                future: rest,
            };
        }

        const next = reducer(state.present, action as A);
        if (next === state.present) {
            return state;
        }
        return {
            present: next,
            past: [...state.past, state.present],
            future: [],
        };
    };
}
