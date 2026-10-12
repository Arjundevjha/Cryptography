# Palette's UX & Accessibility Journal

## 2025-05-18 - Async Action Loading Feedback in Workbench Panels
**Learning:** Cryptographic operations (such as RSA key generation and block cipher execution) can experience slight network or computation latency. Without explicit `disabled`, `aria-busy`, and dynamic text feedback (`Generating Keys...`, `Executing...`), users can trigger duplicate async requests and screen reader users receive no feedback when operations begin.
**Action:** Always combine `disabled={loading}`, `aria-busy={loading}`, spinning visual icons, and dynamic text/`aria-label` updates on async action buttons in workbench panels.
