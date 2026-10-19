# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Museum Navigation ARIA Labels
**Learning:** Icon-assisted navigation buttons (e.g. Lobby Entrance, Wing headers, Statue cards, and Exhibit room cards) often rely on text spans or composite children ("CLASSICAL CIPHERS WING", "Caesar Cipher 100 BCE ENTER") which screen readers announce verbosely or redundantly.
**Action:** Always provide explicit, concise `aria-label` attributes (e.g., `aria-label="Return to Grand Entrance Lobby"`, `aria-label={`Navigate to ${wing.name}`}`) for header navigation and card triggers.
