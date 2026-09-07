# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-18 - Live-Region Output Container Accessibility
**Learning:** Attaching `<label htmlFor="...">` to non-labelable elements like `<div>` output status containers violates HTML semantics.
**Action:** Use a descriptive `<span id="...">` header with `aria-labelledby="..."` and `role="status" aria-live="polite"` on output containers to announce updates cleanly to screen readers.
