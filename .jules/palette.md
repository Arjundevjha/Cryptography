## 2025-05-18 - [Modal Drawers Keyboard Dismissal & Shortcut Tooltips]
**Learning:** In slide-out modal drawers (e.g. `ArtifactMetadataDrawer` and `StatueCuratorialDrawer`), keyboard users expect standard `Escape` key dismissal and clear shortcut hints (e.g., `(Esc)`) on close buttons alongside ARIA dialog roles.
**Action:** Always bind `window` `Escape` keydown listeners with cleanup in modal drawer components and add `title` tooltip hints to close buttons.
