## 2026-03-29 - Drawer Dialog Escape Key Dismissal & ARIA Modal Attributes
**Learning:** React side-drawer modal dialogs (`role="dialog"`) require `aria-modal="true"` and explicit `Escape` key event listeners (`window.addEventListener('keydown', ...)`) to fulfill W3C WAI-ARIA dialog modal patterns for screen readers and keyboard accessibility.
**Action:** When building overlay drawers or modal dialogs in this repository, always attach an `Escape` key listener in `useEffect` and set `aria-modal="true"` on the container dialog.
