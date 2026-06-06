import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDocumentState } from './useDocumentState';

type HookValue = ReturnType<typeof useDocumentState>;

function Probe({ onRender }: { onRender: (value: HookValue) => void }) {
    const value = useDocumentState();
    onRender(value);
    return null;
}

function setupHook() {
    let latest: HookValue;
    const onRender = (value: HookValue) => {
        latest = value;
    };
    render(<Probe onRender={onRender} />);
    return () => latest;
}

describe('useDocumentState', () => {
    it('wires reducer + history with stable actions and undo/redo flow', () => {
        const get = setupHook();

        const initial = get();
        const initialSectionCount = initial.document.sections.length;
        expect(initial.canUndo).toBe(false);
        expect(initial.canRedo).toBe(false);

        const actionsRef = initial.actions;

        act(() => {
            initial.actions.addSection();
        });

        const afterAdd = get();
        expect(afterAdd.document.sections.length).toBe(initialSectionCount + 1);
        expect(afterAdd.canUndo).toBe(true);
        expect(afterAdd.canRedo).toBe(false);
        // actions object is memoized; consumers can rely on referential equality.
        expect(afterAdd.actions).toBe(actionsRef);

        act(() => {
            afterAdd.actions.undo();
        });

        const afterUndo = get();
        expect(afterUndo.document.sections.length).toBe(initialSectionCount);
        expect(afterUndo.canUndo).toBe(false);
        expect(afterUndo.canRedo).toBe(true);
    });
});
