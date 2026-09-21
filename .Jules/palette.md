# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-18 - Tab Control ARIA Roles & Interactive Focus Rings
**Learning:** Custom tab switchers in curatorial drawers and interactive cards in the 3D museum overlay lacked `role="tablist"`, `role="tab"`, `aria-selected` attributes, and `focus-visible` ring indicators, making keyboard navigation silent and invisible to screen reader users.
**Action:** Always wrap custom tab controls in `role="tablist"`, tag tab buttons with `role="tab"` and `aria-selected`, and apply `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none` across all clickable card and tab elements.
