# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Guided Tour Stepper Accessibility and Dismissal
**Learning:** Guided walkthrough docks frequently render progress indicators as inert visual dot spans with `aria-hidden="true"`, preventing users from directly jumping across sequence stops and depriving screen readers and keyboard navigators of non-linear navigation. Additionally, persistent dock overlays require standardized `Escape` key dismissal to match modal dialog expectations.
**Action:** Wrap sequential tour step indicators in a `<nav aria-label="...">` container with interactive `<button>` elements sporting `aria-current="step"`, stop-specific descriptive `aria-label`s, visible focus rings, and register global `Escape` key listeners on active overlays.
