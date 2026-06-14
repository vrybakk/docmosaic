---
'@docmosaic/react': major
---

Responsive editor — the app-shell adapts to phones and tablets, and the canvas, sections, and drag-and-drop now work by touch.

Breaking: `Editor.PageThumbnail` replaces its `dragHandlers` / `dropIndicators` props with a single `onMovePage(fromIndex, toIndex)` callback. Reorder is now driven through react-dnd's multi-backend so it works on touch; the bundled `Editor.Pages` is updated automatically — only consumers mounting `Editor.PageThumbnail` directly need to migrate.

Additive:

-   Below 1024px the editor renders a touch-first shell — a compact top bar, a full-bleed canvas, a horizontally-scrollable tool strip, and Pages / Layers / Edit / Doc panels surfaced as slide-up bottom sheets. The page-size, orientation, preview, and print controls move into the "Doc" sheet. The desktop three-pane shell is unchanged.
-   Canvas gains pinch-to-zoom and two-finger pan; section drag, resize, and crop use pointer events with finger-sized hit targets. All touch paths are gated on multi-pointer or `isPrimary`, so the desktop mouse experience is byte-for-byte unchanged.
-   Section floating toolbars clamp horizontally so they stay on-screen for sections near a narrow viewport's edge.
