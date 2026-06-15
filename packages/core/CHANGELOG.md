# @docmosaic/core

## 1.1.0

### Minor Changes

-   a76040a: Add Frames — container frames and placeholder (image-mask) frames. Fully additive; existing documents and APIs are unchanged.

    -   **core**: new `FrameSection` type, optional `SectionBase.parentFrameId` and `ImageSection.maskShape` fields, and the helpers `resolveFrameParent` (which frame contains a section) and `orderSectionsForRender` (shared back-to-front sort — frames draw behind their children). Container frames own child sections (group move + delete/duplicate cascade); placeholder frames clip an image to a `rect` / `circle` / `line` mask in the PDF and PNG pipelines.
    -   **react**: new `Editor.FrameToolButton` and `Editor.ImageFrameToolButton` primitives, `frameTool` / `imageFrameTool` UI state, draw-to-size frame tools, drag-to-adopt, and move-with-children.

## 1.0.0

### Major Changes

-   v1.0 release. Removes deprecated aliases. See migration guide.

## 0.1.0

### Minor Changes

-   Initial release of @docmosaic/core and @docmosaic/react.

    -   @docmosaic/core: framework-agnostic types, factories, reducer, history, PDF generation
    -   @docmosaic/react: Editor compound API with Root/Canvas/Section/Toolbar/Header/Preview primitives
    -   Controlled + uncontrolled modes
    -   Pluggable PDF backend (pdf prop on Editor.Root)
    -   Injectable image renderer + analytics tracker
    -   CSS-variable theming via --editor-\* tokens
