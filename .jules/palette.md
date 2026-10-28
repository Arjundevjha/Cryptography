## 2026-10-28 - Bidirectional Cipher Workbench Round-Trip UX Pattern
**Learning:** In interactive encryption/decryption workbenches, users frequently need to test round-trip reversibility. Providing a 1-click "Swap Input & Output" action that moves output into input, resets output, and toggles mode significantly reduces friction while maintaining explicit `aria-label` and `focus-visible` ring indicators.
**Action:** Include a dedicated Swap action alongside Copy buttons in output containers for bi-directional form workbenches.
