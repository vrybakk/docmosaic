import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from 'lucide-react';
import { Editor, useEditor } from '@docmosaic/react';

import { documentWithSections } from '../helpers/sample-documents';

/**
 * Layer-order actions live on the per-section toolbar that
 * `Editor.Section` renders. These stories surface each action as a
 * standalone toolbar button so callers can preview the affordance in a
 * shared toolbar context. They call `useEditor().actions.{bringToFront,
 * sendToBack, moveForward, moveBackward}` against the currently selected
 * section.
 *
 * Each story seeds a document with two stacked sections and selects the
 * first one so the action has a target.
 */
const meta: Meta = {
    title: 'Editor/Layer Buttons',
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Editor.Root defaultDocument={documentWithSections()}>
                <SelectFirstSection />
                <div className="border-b bg-white p-4">
                    <div className="flex items-center gap-2">
                        <Story />
                    </div>
                </div>
            </Editor.Root>
        ),
    ],
};

export default meta;
type Story = StoryObj;

function SelectFirstSection() {
    const { state, ui } = useEditor();
    const first = state.sections[0];
    if (first && ui.selectedSectionId !== first.id) {
        ui.setSelectedSectionId(first.id);
    }
    return null;
}

function useSelectedId() {
    const { ui } = useEditor();
    return ui.selectedSectionId;
}

/** Bring the selected section to the top of the stack. */
export const BringToFront: Story = {
    render: () => {
        function Btn() {
            const { actions } = useEditor();
            const id = useSelectedId();
            return (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                    onClick={() => id && actions.bringToFront(id)}
                >
                    <ChevronsUp className="h-4 w-4" />
                    Bring to front
                </button>
            );
        }
        return <Btn />;
    },
};

/** Send the selected section to the bottom of the stack. */
export const SendToBack: Story = {
    render: () => {
        function Btn() {
            const { actions } = useEditor();
            const id = useSelectedId();
            return (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                    onClick={() => id && actions.sendToBack(id)}
                >
                    <ChevronsDown className="h-4 w-4" />
                    Send to back
                </button>
            );
        }
        return <Btn />;
    },
};

/** Move the selected section one step up in the stack. */
export const MoveForward: Story = {
    render: () => {
        function Btn() {
            const { actions } = useEditor();
            const id = useSelectedId();
            return (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                    onClick={() => id && actions.moveForward(id)}
                >
                    <ChevronUp className="h-4 w-4" />
                    Move forward
                </button>
            );
        }
        return <Btn />;
    },
};

/** Move the selected section one step down in the stack. */
export const MoveBackward: Story = {
    render: () => {
        function Btn() {
            const { actions } = useEditor();
            const id = useSelectedId();
            return (
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
                    onClick={() => id && actions.moveBackward(id)}
                >
                    <ChevronDown className="h-4 w-4" />
                    Move backward
                </button>
            );
        }
        return <Btn />;
    },
};
