# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Screen Reader Confirmation for Clipboard Copy Actions
**Learning:** Visual-only feedback (e.g. changing button text/icon to "Copied!") is insufficient for screen reader users who do not perceive visual state shifts when activating copy buttons.
**Action:** Always include an `aria-live="polite"` element with `role="status"` and `className="sr-only"` that updates its text (e.g. "Copied ciphertext to clipboard") whenever a clipboard copy action succeeds.
