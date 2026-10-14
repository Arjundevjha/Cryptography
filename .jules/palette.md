# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-14 - Modal Drawer Escape Dismissal & WebGL CSP Support
**Learning:** Three.js and `@react-three/fiber` WebGL shader compilation require `'unsafe-eval'` in Next.js Content-Security-Policy `script-src` directive. Interactive overlay drawers (like `ArtifactMetadataDrawer`) must specify `aria-modal="true"` and attach an `Escape` keydown event listener to adhere to standard WAI-ARIA dialog patterns and provide keyboard power users a quick way to dismiss close-up views.
**Action:** Ensure slide-over drawers use `aria-modal="true"` with `Escape` key event listeners, and include `'unsafe-eval'` in CSP `script-src` when embedding WebGL/Three.js canvases.
