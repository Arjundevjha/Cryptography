# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/tests/e2e/interactions.spec.ts >> Tier 3: Pairwise Interactions & Visual Integration E2E Tests >> TC-T2B-NAV-ACTIVE-ON-LOAD (Active node highlighted on load)
- Location: web/tests/e2e/interactions.spec.ts:247:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tier 3: Pairwise Interactions & Visual Integration E2E Tests', () => {
  4   |   test.beforeEach(async ({ page }) => {
> 5   |     await page.goto('/');
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  6   |   });
  7   | 
  8   |   test('TC-T3-INTERACT-01 (Input State Persistence)', async ({ page }) => {
  9   |     const caesarInput = page.locator('[data-testid="input-text-caesar"]');
  10  |     await caesarInput.fill('My Secret Text');
  11  |     
  12  |     // Scroll to Enigma and fill
  13  |     const enigmaExhibit = page.locator('[data-testid="exhibit-enigma"]');
  14  |     await enigmaExhibit.scrollIntoViewIfNeeded();
  15  |     
  16  |     const enigmaInput = page.locator('[data-testid="input-text-enigma"]');
  17  |     await enigmaInput.fill('Some enigma text');
  18  |     
  19  |     // Scroll back to Caesar
  20  |     const caesarExhibit = page.locator('[data-testid="exhibit-caesar"]');
  21  |     await caesarExhibit.scrollIntoViewIfNeeded();
  22  |     
  23  |     await expect(caesarInput).toHaveValue('My Secret Text');
  24  |   });
  25  | 
  26  |   test('TC-T3-INTERACT-02 (Mode Select State Preservation)', async ({ page }) => {
  27  |     const affineMode = page.locator('[data-testid="mode-select-affine"]');
  28  |     if (await affineMode.count() > 0) {
  29  |       await affineMode.selectOption('decrypt');
  30  |     } else {
  31  |       const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
  32  |       if (await decryptBtn.count() > 0) {
  33  |         await decryptBtn.click();
  34  |       }
  35  |     }
  36  |     
  37  |     // Click timeline nodes
  38  |     const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
  39  |     await vigenereNode.click();
  40  |     
  41  |     const affineNode = page.locator('[data-testid="timeline-node-affine"]');
  42  |     await affineNode.click();
  43  |     
  44  |     // Verify mode is still decrypt
  45  |     if (await affineMode.count() > 0) {
  46  |       await expect(affineMode).toHaveValue('decrypt');
  47  |     } else {
  48  |       const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
  49  |       if (await decryptBtn.count() > 0) {
  50  |         await expect(decryptBtn).toHaveClass(/active|selected/);
  51  |       }
  52  |     }
  53  |   });
  54  | 
  55  |   test('TC-T3-INTERACT-03 (Global/Local Playback Control Integration)', async ({ page }) => {
  56  |     // Start playback on Caesar
  57  |     await page.fill('[data-testid="input-text-caesar"]', 'TEST PLAYBACK PAUSE STATE');
  58  |     const playBtn = page.locator('[data-testid="play-btn-caesar"]');
  59  |     await expect(playBtn).toBeVisible();
  60  |     await playBtn.click();
  61  |     
  62  |     // Switch focus by scrolling/clicking another cipher node
  63  |     const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
  64  |     await vigenereNode.click();
  65  |     
  66  |     // Caesar animation should pause/stop when out of focus
  67  |     const pauseBtn = page.locator('[data-testid="pause-btn-caesar"]');
  68  |     if (await pauseBtn.count() > 0) {
  69  |       // If it paused, play button might be active again or status is idle
  70  |       await expect(playBtn).toBeVisible();
  71  |     }
  72  |   });
  73  | 
  74  |   test('TC-T3-INTERACT-04 (Timeline Scroll Sync)', async ({ page }) => {
  75  |     const aesNode = page.locator('[data-testid="timeline-node-aes"]');
  76  |     await aesNode.click();
  77  |     
  78  |     // Check that exhibit AES is scrolled into view
  79  |     const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
  80  |     await expect(aesExhibit).toBeInViewport();
  81  |     
  82  |     // Check timeline node is highlighted
  83  |     await expect(aesNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);
  84  |   });
  85  | 
  86  |   test('TC-T3-INTERACT-05 (Mobile Viewport Responsiveness)', async ({ page }) => {
  87  |     await page.setViewportSize({ width: 375, height: 667 });
  88  |     
  89  |     const caesarExhibit = page.locator('[data-testid="exhibit-caesar"]');
  90  |     await expect(caesarExhibit).toBeVisible();
  91  |     
  92  |     const timeline = page.locator('[data-testid^="timeline-node-"]').first();
  93  |     await expect(timeline).toBeVisible();
  94  |   });
  95  | 
  96  |   test('TC-T3-INTERACT-06 (Theme Contrast Compliance)', async ({ page }) => {
  97  |     // Verify page has elements conforming to CSS background and colors
  98  |     const body = page.locator('body');
  99  |     await expect(body).toBeVisible();
  100 |     
  101 |     const firstExhibit = page.locator('[data-testid^="exhibit-"]').first();
  102 |     await expect(firstExhibit).toHaveCSS('color', /rgb/);
  103 |   });
  104 | 
  105 |   test('TC-T3-INTERACT-07 (Reduced Motion Media Query)', async ({ page }) => {
```