# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Keyboard Shortcut Discoverability in Form Actions
**Learning:** Multiline text inputs in interactive panels like WorkbenchPanel trap keyboard-first users into tab navigation unless accelerated by standard `Ctrl+Enter` / `Cmd+Enter` submit shortcuts. However, without an inline `<kbd>` badge and explicit ARIA/title descriptions on the action button, the capability remains undiscovered.
**Action:** Pair keydown shortcut listeners with visible `<kbd>` badges and descriptive `aria-label`s/`title` attributes on the primary trigger button.
