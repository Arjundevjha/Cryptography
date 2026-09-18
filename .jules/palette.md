# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-02-17 - HUD Navigation Active State and Keyboard Focus Ring Indicators
**Learning:** Top navigation bars with visual-only active indicators (like background color changes) are invisible to screen readers, and custom buttons without explicit focus-visible ring styles hinder keyboard accessibility in dark-themed interfaces.
**Action:** Always include `aria-current="page"` on active view/page buttons and append `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none` for distinct keyboard focus indicators across header/HUD components.
