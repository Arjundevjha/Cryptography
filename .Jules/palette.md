# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Icon-Only Buttons Accessibility
**Learning:** Dialog and drawer close buttons utilizing SVG icons (e.g., Lucide `X`) lacked `aria-label` attributes and focus visible indicators, rendering them invisible to screen readers and difficult to identify during keyboard tab navigation.
**Action:** Always attach descriptive `aria-label`s and `focus-visible:ring-2 focus-visible:ring-amber-500` styles to icon-only control buttons across HUD and modal components.

## 2025-05-19 - Workbench Output-to-Input Swap Action
**Learning:** In interactive cipher workbenches, users frequently want to decrypt an encrypted output or test reversible transformations. Forcing manual copy-pasting slows workflow and risks selection errors. Adding a 'Swap' action alongside 'Copy' that moves ciphertext into plaintext input, toggles encrypt/decrypt mode, and announces state via `aria-live="polite"` creates a seamless loop.
**Action:** Provide explicit 'Swap' action buttons in input/output workbench panels with `aria-live` announcements and keyboard focus states.
