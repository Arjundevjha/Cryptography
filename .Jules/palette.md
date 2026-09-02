# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2026-09-02 - SVG Interactive Elements Accessibility
**Learning:** Interactive SVG elements (such as `<g>` floorplan map markers) with `onClick` handlers are invisible to screen readers and skipped during keyboard Tab navigation unless assigned explicit button semantics.
**Action:** Always attach `role="button"`, `tabIndex={0}`, descriptive `aria-label`, focus visible ring styles, and `onKeyDown` (Enter/Space) handlers to interactive SVG groups or markers.
