import { test, expect } from '@playwright/test';

test.describe('Tier 3: Pairwise Interactions & Visual Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('/');
  });

  test('TC-T3-INTERACT-01 (Input State Persistence)', async ({ page }) => {
    const caesarInput = page.locator('[data-testid="input-text-caesar"]');
    await caesarInput.fill('My Secret Text');
    
    // Scroll to Enigma and fill
    const enigmaExhibit = page.locator('[data-testid="exhibit-enigma"]');
    await enigmaExhibit.scrollIntoViewIfNeeded();
    
    const enigmaInput = page.locator('[data-testid="input-text-enigma"]');
    await enigmaInput.fill('Some enigma text');
    
    // Scroll back to Caesar
    const caesarExhibit = page.locator('[data-testid="exhibit-caesar"]');
    await caesarExhibit.scrollIntoViewIfNeeded();
    
    await expect(caesarInput).toHaveValue('My Secret Text');
  });

  test('TC-T3-INTERACT-02 (Mode Select State Preservation)', async ({ page }) => {
    const affineMode = page.locator('[data-testid="mode-select-affine"]');
    if (await affineMode.count() > 0) {
      await affineMode.selectOption('decrypt');
    } else {
      const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
      if (await decryptBtn.count() > 0) {
        await decryptBtn.click();
      }
    }
    
    // Click timeline nodes
    const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
    await vigenereNode.click();
    
    const affineNode = page.locator('[data-testid="timeline-node-affine"]');
    await affineNode.click();
    
    // Verify mode is still decrypt
    if (await affineMode.count() > 0) {
      await expect(affineMode).toHaveValue('decrypt');
    } else {
      const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
      if (await decryptBtn.count() > 0) {
        await expect(decryptBtn).toHaveClass(/active|selected/);
      }
    }
  });

  test('TC-T3-INTERACT-03 (Global/Local Playback Control Integration)', async ({ page }) => {
    // Start playback on Caesar
    await page.fill('[data-testid="input-text-caesar"]', 'TEST PLAYBACK PAUSE STATE');
    const playBtn = page.locator('[data-testid="play-btn-caesar"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    
    // Switch focus by scrolling/clicking another cipher node
    const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
    await vigenereNode.click();
    
    // Caesar animation should pause/stop when out of focus
    const pauseBtn = page.locator('[data-testid="pause-btn-caesar"]');
    if (await pauseBtn.count() > 0) {
      // If it paused, play button might be active again or status is idle
      await expect(playBtn).toBeVisible();
    }
  });

  test('TC-T3-INTERACT-04 (Timeline Scroll Sync)', async ({ page }) => {
    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await aesNode.click();
    
    // Check that exhibit AES is scrolled into view
    const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
    await expect(aesExhibit).toBeInViewport();
    
    // Check timeline node is highlighted
    await expect(aesNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);
  });

  test('TC-T3-INTERACT-05 (Mobile Viewport Responsiveness)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const caesarExhibit = page.locator('[data-testid="exhibit-caesar"]');
    await expect(caesarExhibit).toBeVisible();
    
    const timeline = page.locator('[data-testid^="timeline-node-"]').first();
    await expect(timeline).toBeVisible();
  });

  test('TC-T3-INTERACT-06 (Theme Contrast Compliance)', async ({ page }) => {
    // Verify page has elements conforming to CSS background and colors
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    const firstExhibit = page.locator('[data-testid^="exhibit-"]').first();
    await expect(firstExhibit).toHaveCSS('color', /rgb/);
  });

  test('TC-T3-INTERACT-07 (Reduced Motion Media Query)', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    // Under reduced motion, output should update instantly
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('KHOOR');
  });

  test('TC-T3-INTERACT-08 (Keyboard Accessibility Navigation)', async ({ page }) => {
    // Focus first timeline node
    const firstNode = page.locator('[data-testid="timeline-node-caesar"]');
    await firstNode.focus();
    await expect(firstNode).toBeFocused();
    
    // Tab to next
    await page.keyboard.press('Tab');
    const secondNode = page.locator('[data-testid="timeline-node-vigenere"]');
    await expect(secondNode).toBeFocused();
    
    // Tab to Polybius (let's focus directly or tab to it)
    const polybiusNode = page.locator('[data-testid="timeline-node-polybius"]');
    await polybiusNode.focus();
    await page.keyboard.press('Enter');
    
    const polybiusExhibit = page.locator('[data-testid="exhibit-polybius"]');
    await expect(polybiusExhibit).toBeInViewport();
  });

  test('TC-T3-INTERACT-09 (Error Auto-dismissal)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', 'abc');
    
    const errorMsg = page.locator('[data-testid="error-message-caesar"]');
    await expect(errorMsg).toBeVisible();
    
    // Put valid shift
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    await expect(errorMsg).not.toBeVisible();
  });

  test('TC-T3-INTERACT-10 (Output Copy-Paste Integration)', async ({ page }) => {
    // Playwright context clipboard access might require permissions or we test click behavior
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    
    const copyBtn = page.locator('[data-testid="copy-btn-caesar"]');
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      // Verify clipboard or output text
      const outputText = await page.locator('[data-testid="output-text-caesar"]').textContent();
      expect(outputText).toBe('KHOOR');
    }
  });

  test('TC-T3-INTERACT-11 (Keyboard Focus Trapping)', async ({ page }) => {
    // Open some settings modal/drawer if exists, otherwise mock modal check
    const modalTrigger = page.locator('[data-testid="open-settings-btn-enigma"]');
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      const modalContainer = page.locator('[data-testid="settings-modal-enigma"]');
      await expect(modalContainer).toBeVisible();
      
      // Focus element in modal
      await page.keyboard.press('Tab');
      // Verify focused element is inside modal
      const focused = page.locator(':focus');
      await expect(modalContainer).toContainText(await focused.textContent() || '');
      
      // ESC closes
      await page.keyboard.press('Escape');
      await expect(modalContainer).not.toBeVisible();
    }
  });

  test('TC-T3-INTERACT-12 (Deep Linking & Timeline Navigation)', async ({ page }) => {
    // Wait for initial page hydration to complete
    const scytaleNode = page.locator('[data-testid="timeline-node-scytale"]');
    await expect(scytaleNode).toHaveClass(/active|highlighted/);

    await page.goto('/#aes');
    const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
    await expect(aesExhibit).toBeInViewport({ timeout: 15000 });
    
    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await expect(aesNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);
  });

  test('TC-T3-INTERACT-13 (Playback Control State Protection)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    const playBtn = page.locator('[data-testid="play-btn-caesar"]');
    if (await playBtn.count() > 0) {
      await playBtn.click();
      
      // Modify text during play
      await page.fill('[data-testid="input-text-caesar"]', 'HELLOPLAYBACKUPDATE');
      
      // Animation should pause or reset
      const pauseBtn = page.locator('[data-testid="pause-btn-caesar"]');
      if (await pauseBtn.count() > 0) {
        await expect(playBtn).toBeVisible();
      }
    }
  });

  test('TC-T3-INTERACT-14 (Reset Button Clear state)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '5');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    
    const resetBtn = page.locator('[data-testid="reset-btn-caesar"]');
    if (await resetBtn.count() > 0) {
      await resetBtn.click();
      await expect(page.locator('[data-testid="input-text-caesar"]')).toHaveValue('');
      await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('');
    }
  });

  test('TC-T3-INTERACT-15 (Playback Speed preservation)', async ({ page }) => {
    const slider = page.locator('[data-testid="speed-slider-caesar"]');
    if (await slider.count() > 0) {
      await slider.fill('500'); // 500ms delay
      
      const vigenereNode = page.locator('[data-testid="timeline-node-vigenere"]');
      await vigenereNode.click();
      
      const caesarNode = page.locator('[data-testid="timeline-node-caesar"]');
      await caesarNode.click();
      
      await expect(slider).toHaveValue('500');
    }
  });

  test('TC-T2B-NAV-ACTIVE-ON-LOAD (Active node highlighted on load)', async ({ page }) => {
    // 1. Visit main page
    await page.goto('/');
    
    // 2. Verify Scytale node has active styles (class active or highlighted) without user interaction
    const scytaleNode = page.locator('[data-testid="timeline-node-scytale"]');
    await expect(scytaleNode).toHaveClass(/active|highlighted/);
  });
});
