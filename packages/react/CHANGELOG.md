# @docmosaic/react

## 2.0.0

### Major Changes

-   2b1b873: Responsive editor — the app-shell adapts to phones and tablets, and the canvas, sections, and drag-and-drop now work by touch.

    Breaking: `Editor.PageThumbnail` replaces its `dragHandlers` / `dropIndicators` props with a single `onMovePage(fromIndex, toIndex)` callback. Reorder is now driven through react-dnd's multi-backend so it works on touch; the bundled `Editor.Pages` is updated automatically — only consumers mounting `Editor.PageThumbnail` directly need to migrate.

    Additive:

    -   Below 1024px the editor renders a touch-first shell — a compact top bar, a full-bleed canvas, a horizontally-scrollable tool strip, and Pages / Layers / Edit / Doc panels surfaced as slide-up bottom sheets. The page-size, orientation, preview, and print controls move into the "Doc" sheet. The desktop three-pane shell is unchanged.
    -   Canvas gains pinch-to-zoom and two-finger pan; section drag, resize, and crop use pointer events with finger-sized hit targets. All touch paths are gated on multi-pointer or `isPrimary`, so the desktop mouse experience is byte-for-byte unchanged.
    -   Section floating toolbars clamp horizontally so they stay on-screen for sections near a narrow viewport's edge.

-   ef6d963: Breaking: remove the legacy `editor-*` Tailwind color classes and the `--editor-color-*` CSS aliases. Use the shadcn-aligned semantic tokens instead (`bg-editor-accent` → `bg-primary`, `var(--editor-color-success)` → `var(--accent)`). Structural tokens (`rounded-editor-section`, `shadow-editor-section`, `--editor-radius-section`, `--editor-shadow-section`) are kept. See the v2.0 migration guide.

### Minor Changes

-   a76040a: Add Frames — container frames and placeholder (image-mask) frames. Fully additive; existing documents and APIs are unchanged.

    -   **core**: new `FrameSection` type, optional `SectionBase.parentFrameId` and `ImageSection.maskShape` fields, and the helpers `resolveFrameParent` (which frame contains a section) and `orderSectionsForRender` (shared back-to-front sort — frames draw behind their children). Container frames own child sections (group move + delete/duplicate cascade); placeholder frames clip an image to a `rect` / `circle` / `line` mask in the PDF and PNG pipelines.
    -   **react**: new `Editor.FrameToolButton` and `Editor.ImageFrameToolButton` primitives, `frameTool` / `imageFrameTool` UI state, draw-to-size frame tools, drag-to-adopt, and move-with-children.

### Patch Changes

-   Updated dependencies [a76040a]
    -   @docmosaic/core@1.1.0

## 1.0.0

### Major Changes

-   v1.0 release. Removes deprecated aliases. See migration guide.

### Patch Changes

-   Updated dependencies
    -   @docmosaic/core@1.0.0

## 0.1.0

### Minor Changes

-   Initial release of @docmosaic/core and @docmosaic/react.

    -   @docmosaic/core: framework-agnostic types, factories, reducer, history, PDF generation
    -   @docmosaic/react: Editor compound API with Root/Canvas/Section/Toolbar/Header/Preview primitives
    -   Controlled + uncontrolled modes
    -   Pluggable PDF backend (pdf prop on Editor.Root)
    -   Injectable image renderer + analytics tracker
    -   CSS-variable theming via --editor-\* tokens

### Patch Changes

-   Updated dependencies
    -   @docmosaic/core@0.1.0
