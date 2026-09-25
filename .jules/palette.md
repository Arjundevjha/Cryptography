## 2025-02-23 - Accessible Custom Tab Switchers

**Learning:** Custom tab buttons implemented using `<button>` elements in UI panels (such as `StatueCuratorialDrawer`) require `role="tablist"` on their container, `role="tab"` and `aria-selected` attributes on each tab button, corresponding `id` and `aria-controls` bindings, and explicit `focus-visible:ring-2` focus indicator styles to ensure full keyboard navigation and screen reader accessibility.

**Action:** Whenever creating or updating tabbed view switchers, always wrap buttons in a `role="tablist"` container, assign `role="tab"`, `aria-selected`, `aria-controls`, and `focus-visible:ring-2` focus rings to the buttons, and associate the panel content container using `role="tabpanel"`, `id`, and `aria-labelledby`.
