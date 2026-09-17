# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Navigation Header Focus & Active Page Semantics
**Learning:** Top fixed navigation headers with active state buttons (e.g., wing or lobby navigation) often rely solely on visual color differences (e.g., `bg-amber-500`) to indicate selection, leaving screen reader and keyboard users without context on the active view location or focus indicators.
**Action:** Always include `aria-current="page"` on active navigation item buttons and ensure `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none` focus styles are attached to all HUD navigation controls.
