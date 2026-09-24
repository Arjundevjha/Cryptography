# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Drawer Mode Switcher Tabs Accessibility & Keyboard Focus
**Learning:** Custom tabbed interface switchers inside slide-out drawers (e.g. `StatueCuratorialDrawer`) lacked explicit `role="tablist"`, `role="tab"`, and `aria-selected` attributes as well as `focus-visible` ring indicators, preventing screen readers from identifying active tab states and making keyboard tabbing invisible.
**Action:** Always wrap tab switchers in `role="tablist"`, declare `role="tab"` with dynamic `aria-selected` attributes on buttons, and apply visible focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none`).
