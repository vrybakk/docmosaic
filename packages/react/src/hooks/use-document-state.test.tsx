import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDocumentState } from './use-document-state';

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

    it('creates a shape at explicit rect geometry in one history step (draw-to-size)', () => {
        const get = setupHook();
        const initialCount = get().document.sections.length;

        act(() => {
            get().actions.addSection({
                type: 'shape',
                shape: 'circle',
                rect: { x: 120, y: 80, width: 240, height: 160 },
            });
        });

        const after = get();
        expect(after.document.sections.length).toBe(initialCount + 1);
        const created = after.document.sections[after.document.sections.length - 1];
        expect(created.type).toBe('shape');
        if (created.type !== 'shape') throw new Error('narrowing');
        expect(created.shape).toBe('circle');
        // rect overrides the factory defaults verbatim (PDF points, no scaling).
        expect({
            x: created.x,
            y: created.y,
            width: created.width,
            height: created.height,
        }).toEqual({ x: 120, y: 80, width: 240, height: 160 });
        // One undoable step — a single undo removes the whole shape.
        expect(after.canUndo).toBe(true);
        act(() => {
            after.actions.undo();
        });
        expect(get().document.sections.length).toBe(initialCount);
    });
});
