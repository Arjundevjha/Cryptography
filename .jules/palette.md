## 2025-10-30 - Keyboard Shortcut Toggle for Modals with Input Focus Guard
**Learning:** Global hotkeys (like 'M' for map) enhance desktop navigation speed, but must always ignore keypresses when the user is focused inside interactive text fields (`INPUT`, `TEXTAREA`, `SELECT`, `isContentEditable`) or using modifier keys (Ctrl/Alt/Meta).
**Action:** Always check `e.target` tag/contentEditable state and modifier keys in global `keydown` event handlers before performing UI state toggles.
