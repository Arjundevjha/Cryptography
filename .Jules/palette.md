# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Interactive Lab Inputs & Sliders Accessibility
**Learning:** Form range sliders and textareas in interactive drawers (e.g. Pioneer Lab) often lack `id`/`htmlFor` associations and focus-visible rings, making slider values difficult to identify or control via screen readers and keyboard navigation.
**Action:** Pair every slider/input in interactive panels with explicit `id`/`htmlFor` label bindings, `aria-label` descriptions, and `focus-visible:ring-2 focus-visible:ring-amber-500` indicators.
