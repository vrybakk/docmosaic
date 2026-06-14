---
'@docmosaic/core': minor
'@docmosaic/react': minor
---

Add Frames — container frames and placeholder (image-mask) frames. Fully additive; existing documents and APIs are unchanged.

-   **core**: new `FrameSection` type, optional `SectionBase.parentFrameId` and `ImageSection.maskShape` fields, and the helpers `resolveFrameParent` (which frame contains a section) and `orderSectionsForRender` (shared back-to-front sort — frames draw behind their children). Container frames own child sections (group move + delete/duplicate cascade); placeholder frames clip an image to a `rect` / `circle` / `line` mask in the PDF and PNG pipelines.
-   **react**: new `Editor.FrameToolButton` and `Editor.ImageFrameToolButton` primitives, `frameTool` / `imageFrameTool` UI state, draw-to-size frame tools, drag-to-adopt, and move-with-children.
