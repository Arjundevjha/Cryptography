# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Audio & Media Toggle State Decoupling
**Learning:** Audio and media toggle control buttons should decouple UI state management (`setMuted`) from Web Audio API node execution to ensure accessible state updates (`aria-pressed`, `aria-label`) function reliably across all client environments and test runners (e.g. JSDOM/Jest).
**Action:** Always update state independently before guarded Web Audio node calls.
