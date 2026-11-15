# Session Handoff Summary

## Executive Summary
Completed UI readability fixes, WebGL multi-room FPS optimizations, removal of the unused "Inspect Display" drawer, Next.js dev CSP fix, and replaced the Hall of Fame pioneer busts (`Al-Kindi`, `Alan Turing`, `Claude Shannon`, `Whitfield Diffie`, `Martin Hellman`) with photo-reconstructed 3D bronze portrait `.glb` sculptures via `TripoSR`.

## Key Technical Decisions
- **Photo-to-3D Portrait Busts** (`scripts/reconstruct_busts_3d.py` -> `web/public/models/bust-*.glb`): Reconstructed 360° vertex-colored `.glb` sculptures from studio bronze portrait references, normalized to `0.92m` height, `min_y = 0`, `+Z` front orientation.
- **GLTF `matrixWorld` & Vertex Colors** (`web/src/components/museum/ThreeMuseumScene.tsx`): Applied `mesh.matrixWorld` in `loadPioneerBust` and enabled `vertexColors: true` with warm patinated bronze `MeshStandardMaterial` (`color: 0xf0d6b8, roughness: 0.44, metalness: 0.28`). Hydrated busts directly via callbacks inside `createPioneerBust` on first load.
- **Multi-Room WebGL FPS**: Replaced `MeshPhysicalMaterial` `transmission`/`clearcoat` and ~36 per-room lights with `MeshStandardMaterial`, consolidated global lights + single active-exhibit spotlight, `shadowMap.enabled = false`, and `pixelRatio <= 1.0`.
- **Tailwind v3 Opacity & Dev CSP**: Replaced `/92`, `/94`, `/96` with `/95` across HUD/workbench drawers; added `'unsafe-eval'` to `web/next.config.js` CSP only in `development`.
- **`/learn` Skill Update**: Updated `~/.gemini/config/skills/threejs-webgl-museum/SKILL.md` with these patterns.

## Verification
- `cd web && npm test`: 5 suites, 68 tests passing.
- `cd web && npx next build`: Clean Turbopack/TypeScript build.
- Playwright browser check on `http://localhost:3099`: Verified Lobby, Al-Kindi, Alan Turing, and Diffie & Hellman busts rendered cleanly on their pedestals with `Page errors: []`.
- `graphify update .`: Rebuilt (`1611 nodes, 2874 edges, 102 communities`).
