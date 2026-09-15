# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Accessible HUD Status Badges
**Learning:** Color-only status indicators (e.g., API health dots) without text labels or ARIA status annotations are inaccessible to screen reader users and keyboard-only navigation.
**Action:** Wrap status indicators with `role="status"`, `aria-label`, `tabIndex={0}`, focus rings, and explicit status text badges (`sr-only sm:not-sr-only`).
