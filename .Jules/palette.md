# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2026-10-10 - Skip-to-Content Link for Keyboard Navigation
**Learning:** Keyboard-only and screen reader users navigating the 3D museum had to tab through all top HUD elements before reaching main interactive exhibit content.
**Action:** Include a visually hidden skip link (`<a href="#main-content">`) at the top of `MuseumHUD.tsx` that receives keyboard focus (`focus:not-sr-only focus:fixed...`) and jumps directly to `id="main-content"` on `MuseumCanvas.tsx`.
