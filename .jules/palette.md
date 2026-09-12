## 2025-05-20 - Workbench Parameter Input Accessibility
**Learning:** Form control `<label>` tags rendered next to `<input>` elements in dynamic workbench panels (like Caesar, Affine, Scytale, AES keys) lacked explicit `htmlFor` bindings and matching `id` attributes, preventing screen readers from announcing parameter context upon focus and disabling click-to-focus label interaction.
**Action:** Ensure all interactive cipher parameter inputs explicitly link `<label htmlFor="...">` to matching `<input id="...">` or supply explicit `aria-label` attributes for compact/inline grid inputs.
