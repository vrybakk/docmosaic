# Manual smoke checklist

Run after every refactor phase. Estimated time: 90 seconds.

1. `bun run dev` (from repo root) and open http://localhost:4001/pdf-editor
2. Click "Add Image Section" — section appears on canvas
3. Drop a JPG file onto a section — image renders
4. Drag the section to a new position — it moves
5. Resize via a corner handle — section resizes proportionally
6. Change page size A4 → Letter — canvas updates
7. Click Download — a PDF downloads with the section + image
8. Undo then Redo — both work

If any step fails, the phase is not done.
