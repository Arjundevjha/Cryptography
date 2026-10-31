# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-19 - Modal Drawer Accessibility & Keyboard Dismissal
**Learning:** Modal slide-out drawers rendered with `role="dialog"` can trap keyboard-only users if they do not listen to standard `Escape` key events, and screen readers fail to recognize modal boundaries when `aria-modal="true"` is omitted.
**Action:** Always bind a `keydown` listener for the `Escape` key to invoke the dismissal callback and include `aria-modal="true"` on all dialog containers.

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.
