/**
 * @vitest-environment happy-dom
 *
 * Phase 23 — `Editor.Root` `readOnly` prop + `Editor.StaticCanvas`.
 *
 * These tests cover the contract:
 * - The `readOnly` flag flows into context.
 * - Keybindings skip mutating actions when `readOnly` is on; the deselect
 *   (`Escape`) binding still fires.
 * - Mutating toolbar buttons (`UndoButton`, `RedoButton`, `AddImageButton`,
 *   `AddTextButton`, `AddShapeButton`, `DrawButton`) hide themselves.
 * - Read-side primitives (`PreviewButton`, `PrintButton`, `DownloadButton`)
 *   stay mounted so the viewer can still export.
 * - `Editor.StaticCanvas` forces the canvas into read-only mode even when
 *   the root is editable.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createDocument, createSection, type Document, type Section } from '@docmosaic/core';
import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { useEditor, useEditorSection, type EditorContextValue } from '../context/editor';
import { Editor } from '../index';

function seedWithSection(): { doc: Document; section: Section } {
    const section: Section = { ...createSection({ x: 0, y: 0, page: 1 }), x: 100, y: 100 };
    return {
        doc: { ...createDocument(), sections: [section] },
        section,
    };
}

function setupReadOnly() {
    const { doc, section } = seedWithSection();

    let latest: EditorContextValue;
    function Probe() {
        const editor = useEditor();
        latest = editor;
        useEffect(() => {
            editor.ui.setSelectedSectionId(section.id);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return null;
    }

    const utils = render(
        <Editor.Root defaultDocument={doc} readOnly>
            <Probe />
            <Editor.Toolbar />
            <Editor.Canvas>
                <Editor.Section />
            </Editor.Canvas>
        </Editor.Root>,
    );

    return {
        ...utils,
        get: () => latest,
        section,
    };
}

function dispatchKey(init: KeyboardEventInit) {
    act(() => {
        fireEvent.keyDown(window, init);
    });
}

describe('Editor.Root — readOnly prop', () => {
    it('defaults to false and exposes it on the context', () => {
        const { doc } = seedWithSection();

        let latest: EditorContextValue;
        function Probe() {
            latest = useEditor();
            return null;
        }

        render(
            <Editor.Root defaultDocument={doc}>
                <Probe />
            </Editor.Root>,
        );

        expect(latest!.readOnly).toBe(false);
    });

    it('flows into the editor context when set', () => {
        const { get } = setupReadOnly();
        expect(get().readOnly).toBe(true);
    });

    it('keybindings skip mutating actions but preserve Escape', () => {
        const { get } = setupReadOnly();
        const startX = get().state.sections[0].x;

        // Mutating bindings — all no-ops.
        dispatchKey({ key: 'Delete' });
        dispatchKey({ key: 'Backspace' });
        dispatchKey({ key: 'ArrowRight' });
        dispatchKey({ key: 'ArrowRight', shiftKey: true });

        expect(get().state.sections).toHaveLength(1);
        expect(get().state.sections[0].x).toBe(startX);
        expect(get().ui.selectedSectionId).not.toBeNull();

        // Deselect still works — it's a read-side operation.
        dispatchKey({ key: 'Escape' });
        expect(get().ui.selectedSectionId).toBeNull();
    });
});

describe('Editor.Root — readOnly hides mutating toolbar buttons', () => {
    it('hides Undo, Redo, and Add/Draw buttons', () => {
        const { doc } = seedWithSection();
        render(
            <Editor.Root defaultDocument={doc} readOnly>
                <Editor.Toolbar>
                    <div className="flex gap-2">
                        <Editor.UndoButton />
                        <Editor.RedoButton />
                        <Editor.AddImageButton />
                        <Editor.AddTextButton />
                        <Editor.AddShapeButton />
                        <Editor.DrawButton />
                        <Editor.PreviewButton />
                        <Editor.PrintButton />
                        <Editor.DownloadButton />
                    </div>
                </Editor.Toolbar>
            </Editor.Root>,
        );

        // Mutating buttons render nothing.
        expect(screen.queryByText('Undo')).toBeNull();
        expect(screen.queryByText('Redo')).toBeNull();
        expect(screen.queryByText('Add Image')).toBeNull();
        expect(screen.queryByText('Add Text')).toBeNull();
        expect(screen.queryByText('Add Rectangle')).toBeNull();
        expect(screen.queryByText('Draw')).toBeNull();

        // Read-side buttons stay live so the viewer can export.
        expect(screen.queryByText('Preview')).not.toBeNull();
        expect(screen.queryByText('Print')).not.toBeNull();
        expect(screen.queryByText('Download PDF')).not.toBeNull();
    });

    it('does not hide mutating buttons when readOnly is false', () => {
        const { doc } = seedWithSection();
        render(
            <Editor.Root defaultDocument={doc}>
                <Editor.Toolbar>
                    <Editor.UndoButton />
                    <Editor.AddImageButton />
                </Editor.Toolbar>
            </Editor.Root>,
        );

        expect(screen.queryByText('Add Image')).not.toBeNull();
    });

    it('keeps download active even when content is present (smoke check)', () => {
        const { doc } = seedWithSection();
        render(
            <Editor.Root defaultDocument={doc} readOnly>
                <Editor.Toolbar>
                    <Editor.DownloadButton />
                </Editor.Toolbar>
            </Editor.Root>,
        );

        const button = screen.getByText('Download PDF').closest('button');
        expect(button).not.toBeNull();
        expect(button?.disabled).toBe(false);
    });
});

describe('Editor.Root — readOnly suppresses section drag updates', () => {
    it('flows through the section context as readOnly: true', async () => {
        const { doc, section } = seedWithSection();

        let latest: ReturnType<typeof useEditorSection> | null = null;
        function SectionProbe() {
            latest = useEditorSection();
            return null;
        }

        render(
            <Editor.Root defaultDocument={doc} readOnly>
                <Editor.Canvas>
                    <SectionProbe />
                </Editor.Canvas>
            </Editor.Root>,
        );

        // The canvas defers section rendering until its first
        // resize-observer pass completes — wait for the probe to populate.
        await waitFor(() => {
            expect(latest).not.toBeNull();
        });
        expect(latest!.readOnly).toBe(true);
        expect(latest!.rawSection.id).toBe(section.id);
    });
});

describe('Editor.StaticCanvas', () => {
    it('forces the section context into readOnly even when the root is editable', async () => {
        const { doc } = seedWithSection();

        let latest: ReturnType<typeof useEditorSection> | null = null;
        function SectionProbe() {
            latest = useEditorSection();
            return null;
        }

        render(
            <Editor.Root defaultDocument={doc}>
                <Editor.StaticCanvas>
                    <SectionProbe />
                </Editor.StaticCanvas>
            </Editor.Root>,
        );

        await waitFor(() => {
            expect(latest).not.toBeNull();
        });
        expect(latest!.readOnly).toBe(true);
    });

    it('still reports the root as editable on useEditor', () => {
        const { doc } = seedWithSection();

        let editorLatest: EditorContextValue | null = null;
        function EditorProbe() {
            editorLatest = useEditor();
            return null;
        }

        render(
            <Editor.Root defaultDocument={doc}>
                <EditorProbe />
                <Editor.StaticCanvas />
            </Editor.Root>,
        );

        // Root-level readOnly is independent of canvas-level readOnly — the
        // editor context still reports the root's view of the world.
        expect(editorLatest).not.toBeNull();
        expect(editorLatest!.readOnly).toBe(false);
    });
});
