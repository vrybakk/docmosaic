import { describe, expect, it } from 'vitest';
import { withHistory, type HistoryState } from './history';

type CounterState = { value: number };
type CounterAction = { type: 'SET'; value: number };

const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
    if (action.type === 'SET') return { value: action.value };
    return state;
};

const tracked = withHistory<CounterState, CounterAction>(counterReducer);

function init(value = 0): HistoryState<CounterState> {
    return { present: { value }, past: [], future: [] };
}

describe('withHistory', () => {
    it('after 3 actions, undo twice then redo once lands on the 2nd action result', () => {
        let state = init(0);
        state = tracked(state, { type: 'SET', value: 1 });
        state = tracked(state, { type: 'SET', value: 2 });
        state = tracked(state, { type: 'SET', value: 3 });

        state = tracked(state, { type: 'UNDO' });
        state = tracked(state, { type: 'UNDO' });
        state = tracked(state, { type: 'REDO' });

        expect(state.present.value).toBe(2);
    });

    it('UNDO on empty past returns the same state', () => {
        const state = init(7);
        const next = tracked(state, { type: 'UNDO' });
        expect(next).toBe(state);
    });

    it('REDO on empty future returns the same state', () => {
        const state = init(7);
        const next = tracked(state, { type: 'REDO' });
        expect(next).toBe(state);
    });

    it('any non-UNDO/REDO action after an undo clears the future', () => {
        let state = init(0);
        state = tracked(state, { type: 'SET', value: 1 });
        state = tracked(state, { type: 'SET', value: 2 });
        state = tracked(state, { type: 'UNDO' });
        expect(state.future).toHaveLength(1);

        state = tracked(state, { type: 'SET', value: 99 });

        expect(state.future).toHaveLength(0);
        expect(state.present.value).toBe(99);
    });
});
