# Cryptography Museum Workspace Rules

## 1. Next.js & Jest Unit Testing
- Always isolate Playwright E2E tests from Jest unit tests. Configure `jest.config.ts` with:
  ```typescript
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/']
  ```
- When mocking browser APIs (e.g., `IntersectionObserver`, `matchMedia`, `scrollIntoView`), do not use arrow functions for constructors. Mock them as constructor-safe functions:
  ```typescript
  window.IntersectionObserver = function() {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  } as any;
  ```

## 2. FastAPI Rewrites & Connection Resiliency
- Proxy all frontend requests under `/api/` to `http://localhost:8000/api/` (locally) or `/api/main/api/` (on Vercel) using `next.config.js` rewrites.
- Provide a status dot indicator (`data-testid="api-status-dot"`) in the footer that polls the API health endpoint.
- In components communicating with the FastAPI backend, wrap requests in try-catch blocks and display a standardized offline fallback message:
  `"Could not reach encryption server — is the API running?"`
- **Vercel Deployment & SSRF Prevention Rules**:
  - In `next.config.js`, detect Vercel using `process.env.VERCEL === '1'` and rewrite `/api/:path*` to `/api/main/api/:path*` to route requests to the compiled FastAPI lambda function.
  - In Next.js route handlers that call the backend, use `process.env.VERCEL_URL` (e.g. `https://${process.env.VERCEL_URL}/api/main`) to construct the absolute destination URL. Do NOT read from client-supplied request headers like `host` to prevent Server-Side Request Forgery (SSRF) security vulnerabilities.
  - In the FastAPI entry point (`main.py`), register an ASGI middleware to strip the `/api/main` prefix from incoming request paths when present so standard routing works.
  - Inject relative paths into `sys.path` dynamically in python serverless scripts to guarantee package imports (e.g. `methods/`) can be resolved in any Vercel execution context.

## 3. Scroll spy and IntersectionObserver Stability
- **Ref Stability**: Always wrap dynamic component ref arrays in `useMemo` to prevent infinite IntersectionObserver disconnect/reconnect rendering loops.
- **Scroll-Lock**: Use a scroll-lock ref (e.g. `isInitialScroll = true`) to temporarily bypass observer triggers during programmatic scrolls (e.g. during page load hash navigation).
- **History Synchronization**: Use a monkey-patched history hook for pushState/replaceState/popstate to ensure back/forward buttons update the layout in sync with Next.js router transitions.

## 4. 3D WebGL & OrbitControls Stability
- **OrbitControls Drag Interruption**: When animating camera transitions with `lerp()`, listen to `controls.addEventListener('start', () => isAnimating = false)`. Stop automated lerping immediately when user starts dragging so orbiting is 100% smooth without resistance or locking.
- **OrbitControls Drag vs. Raycast Click Separation**: Measure mouse movement between `mousedown` and `mouseup` (`Math.hypot(dx, dy) > 6`). Ignore raycast click selection handling during drag releases. Never re-trigger room selection if the clicked 3D target matches the currently active room (`currentViewRef.current`).
- **WebGL Scene Build Isolation**: Scene initialization functions (`buildScene`) must have an empty dependency array (`[]`) and store dynamic callbacks in `useRef` (e.g. `onSelectRoomRef`). This prevents state re-renders from tearing down the WebGL renderer or resetting camera position back to foyer coordinates `(0, 7, 26)`.
- **Radial Spatial Layout**: Space 3D exhibit rooms radially around origin `(0, 0, 0)` with a radius of at least 25-30 units. This prevents adjacent room geometry and backwalls from clipping into each other.
- **UI & 3D Canvas Z-Indexing**: Render the 3D WebGL canvas as a full-screen background (`z-index: 0`). Wrap HUD overlays in `pointer-events-none` containers and add `pointer-events-auto` strictly to interactive controls to ensure 3D mouse drag events are never blocked.
- **Artifact Elevation**: Offset physical 3D artifact geometry origins vertically (`y >= 1.5`) relative to pedestals (`y = 0.6`) to prevent Z-fighting and geometry clipping.
- **Interior Camera Vector Alignment**: Ensure exhibit `cameraPosition` vectors sit strictly inside room spatial boundary boxes (e.g. $Z = Z_{\text{room}} + 3.5$) facing the artifact pedestal. Never place camera selection vectors on or outside threshold boundaries ($Z \ge Z_{\text{room}} + 5.5$) to prevent automatic proximity ejection loops.
- **Decouple WASD Walking from Camera Lerping**: Track spatial room/wing updates with `isSpatialUpdateRef`. When manual WASD walking changes zones, update active state without triggering `isAnimating = true`. Reserve automated camera lerps exclusively for explicit UI button or 3D raycast click events.
- **Architectural Floor Medallions**: Use flat inlaid floor geometries (`RingGeometry` + `CircleGeometry` at $Y = 0.02$) rather than floating partial cylinder arcs (`thetaLength < 2*PI`) to prevent unwanted 3/4 circular obstructions in open foyers.
- **Gate Spatial Proximity to Active Walking**: Never trigger automatic proximity room transitions when the user is stationary or inspecting exhibits. Gate proximity detection strictly to active WASD/Arrow key movement (`isWalking`) and apply a 1.5s grace period upon programmatic room selection to prevent premature inspection kick-outs.
- **Reliable Next.js GLTF Loading**: Always load GLTF binary assets via native `fetch()` -> `res.arrayBuffer()` -> `loader.parse()` rather than `loader.load()` to prevent Turbopack/Next.js client-side hanging. Always check `child.isMesh` and `(child as any).isGroup` instead of `instanceof`.
- **Drawer Viewport Centering**: When an exhibit triggers a side panel or curatorial drawer, offset camera vectors to frame the artifact or statue in the visible left 60% of the viewport.

## 5. UI/UX & Techstack Privacy Standards
- **No Techstack Exposure**: Never display internal framework, backend, or engine names (e.g. "FastAPI", "Python Engine", "Uvicorn") in user-facing UI labels, headers, or subtext.
- **Clean Subtext Removal**: When requested to remove technical subtitle subtext under headers, completely remove the subtitle element rather than substituting generic placeholder titles.
