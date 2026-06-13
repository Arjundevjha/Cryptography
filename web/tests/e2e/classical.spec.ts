import { test, expect } from '@playwright/test';

test.describe('Classical Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // CAESAR CIPHER
  // ==========================================

  test('TC-T1-CAESAR-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-caesar"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('KHOOR');
  });

  test('TC-T1-CAESAR-02 (Decrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'KHOOR');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-caesar"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-caesar"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('HELLO');
  });

  test('TC-T1-CAESAR-03 (No Shift)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'NO CHANGE');
    await page.fill('[data-testid="param-shift-caesar"]', '0');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('NO CHANGE');
  });

  test('TC-T1-CAESAR-04 (Case Preservation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'Caesar Cipher 123');
    await page.fill('[data-testid="param-shift-caesar"]', '5');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('Hfjxfw Hnumjw 123');
  });

  test('TC-T1-CAESAR-05 (Visual Wheel Step)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'A');
    await page.fill('[data-testid="param-shift-caesar"]', '1');
    
    const stepBtn = page.locator('[data-testid="step-forward-btn-caesar"]');
    await expect(stepBtn).toBeVisible();
    await stepBtn.click();
    
    const visualizer = page.locator('[data-testid="visualizer-caesar"]');
    await expect(visualizer).toBeVisible();
    // Verify that visualizer contains SVG wheel elements or highlighted paths
    await expect(visualizer.locator('svg')).toBeVisible();
  });

  test('TC-T2-CAESAR-01 (Negative Shift)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '-5');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    // -5 shifts backwards equivalent to +21 shift, or handles gracefully
    const outputText = await page.locator('[data-testid="output-text-caesar"]').textContent();
    expect(outputText === 'CZGGJ' || outputText === 'HELLO').toBe(true);
  });

  test('TC-T2-CAESAR-02 (Extremely Large Shift)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '1000');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    // 1000 % 26 = 12. H + 12 = T, E + 12 = Q, L + 12 = X, L + 12 = X, O + 12 = A. Output: TQXXA
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('TQXXA');
  });

  test('TC-T2-CAESAR-03 (Empty String Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', '');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const errorMsg = page.locator('[data-testid="error-message-caesar"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText('');
  });

  test('TC-T2-CAESAR-04 (Non-Numeric Shift)', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', 'abc');
    
    const errorMsg = page.locator('[data-testid="error-message-caesar"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-CAESAR-05 (Max Length Bound)', async ({ page }) => {
    const validText = 'a'.repeat(500);
    await page.fill('[data-testid="input-text-caesar"]', validText);
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    
    const errorMsg = page.locator('[data-testid="error-message-caesar"]');
    await expect(errorMsg).not.toBeVisible();
    
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-caesar"]', invalidText);
    await expect(errorMsg).toBeVisible();
  });

  // ==========================================
  // VIGENERE CIPHER
  // ==========================================

  test('TC-T1-VIGENERE-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'ATTACKATDAWN');
    await page.fill('[data-testid="param-key-vigenere"]', 'LEMON');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-vigenere"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-vigenere"]')).toHaveText('LXFOPVEFRNHR');
  });

  test('TC-T1-VIGENERE-02 (Decrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'LXFOPVEFRNHR');
    await page.fill('[data-testid="param-key-vigenere"]', 'LEMON');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-vigenere"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-vigenere"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-vigenere"]')).toHaveText('ATTACKATDAWN');
  });

  test('TC-T1-VIGENERE-03 (Key Case Insensitivity)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'hello');
    await page.fill('[data-testid="param-key-vigenere"]', 'kEy');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputText1 = await page.locator('[data-testid="output-text-vigenere"]').textContent();
    
    await page.fill('[data-testid="param-key-vigenere"]', 'KEY');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-vigenere"]')).toHaveText(outputText1 || '');
  });

  test('TC-T1-VIGENERE-04 (Special Characters Preservation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'HELLO WORLD!');
    await page.fill('[data-testid="param-key-vigenere"]', 'KEY');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-vigenere"]')).toHaveText('RIJVS UYVJN!');
  });

  test('TC-T1-VIGENERE-05 (Visual Grid Highlight)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'A');
    await page.fill('[data-testid="param-key-vigenere"]', 'B');
    
    const playBtn = page.locator('[data-testid="play-btn-vigenere"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    
    const visualizer = page.locator('[data-testid="visualizer-vigenere"]');
    await expect(visualizer).toBeVisible();
    // Grid highlights or animations should exist
    await expect(visualizer.locator('table, svg, div').first()).toBeVisible();
  });

  test('TC-T2-VIGENERE-01 (Empty Key Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'HELLO');
    await page.fill('[data-testid="param-key-vigenere"]', '');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const errorMsg = page.locator('[data-testid="error-message-vigenere"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-VIGENERE-02 (Non-Alphabetic Key)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'HELLO');
    await page.fill('[data-testid="param-key-vigenere"]', 'KEY123');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const errorMsg = page.locator('[data-testid="error-message-vigenere"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-VIGENERE-03 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', '');
    await page.fill('[data-testid="param-key-vigenere"]', 'KEY');
    
    const errorMsg = page.locator('[data-testid="error-message-vigenere"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-vigenere"]')).toHaveText('');
  });

  test('TC-T2-VIGENERE-04 (Max Length Bound)', async ({ page }) => {
    const validText = 'a'.repeat(500);
    await page.fill('[data-testid="input-text-vigenere"]', validText);
    await page.fill('[data-testid="param-key-vigenere"]', 'KEY');
    
    const errorMsg = page.locator('[data-testid="error-message-vigenere"]');
    await expect(errorMsg).not.toBeVisible();
    
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-vigenere"]', invalidText);
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-VIGENERE-05 (Key Matching Input Length)', async ({ page }) => {
    await page.fill('[data-testid="input-text-vigenere"]', 'HI');
    await page.fill('[data-testid="param-key-vigenere"]', 'VERYLONGKEY');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-vigenere"]')).not.toBeEmpty();
  });

  // ==========================================
  // AFFINE CIPHER
  // ==========================================

  test('TC-T1-AFFINE-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'ATTACK');
    await page.fill('[data-testid="param-a-affine"]', '5');
    await page.fill('[data-testid="param-b-affine"]', '8');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-affine"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-affine"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-affine"]')).toHaveText('izzisg');
  });

  test('TC-T1-AFFINE-02 (Decrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'izzisg');
    await page.fill('[data-testid="param-a-affine"]', '5');
    await page.fill('[data-testid="param-b-affine"]', '8');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-affine"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-affine"]')).toHaveText('attack');
  });

  test('TC-T1-AFFINE-03 (Coprime a=17)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'HELLO');
    await page.fill('[data-testid="param-a-affine"]', '17');
    await page.fill('[data-testid="param-b-affine"]', '20');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-affine"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-affine"]')).toHaveText('jkzzy');
  });

  test('TC-T1-AFFINE-04 (Key Decryption Reciprocity)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'WORLD');
    await page.fill('[data-testid="param-a-affine"]', '3');
    await page.fill('[data-testid="param-b-affine"]', '5');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-affine"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputText = page.locator('[data-testid="output-text-affine"]');
    await expect(outputText).not.toBeEmpty();
    const ciphertext = await outputText.textContent();
    expect(ciphertext).not.toBeNull();
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-affine"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-affine"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    await page.fill('[data-testid="input-text-affine"]', ciphertext || '');
    
    await expect(page.locator('[data-testid="output-text-affine"]')).toHaveText('world');
  });

  test('TC-T1-AFFINE-05 (Formula Visualizer)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'X');
    await page.fill('[data-testid="param-a-affine"]', '5');
    await page.fill('[data-testid="param-b-affine"]', '8');
    
    const visualizer = page.locator('[data-testid="visualizer-affine"]');
    await expect(visualizer).toBeVisible();
    const formulaText = await visualizer.textContent();
    expect(formulaText?.includes('5') && formulaText?.includes('8') && formulaText?.includes('26')).toBe(true);
  });

  test('TC-T2-AFFINE-01 (Non-Coprime Parameter a)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'HELLO');
    await page.fill('[data-testid="param-a-affine"]', '13');
    await page.fill('[data-testid="param-b-affine"]', '5');
    
    const errorMsg = page.locator('[data-testid="error-message-affine"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AFFINE-02 (Even Value a)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'HELLO');
    await page.fill('[data-testid="param-a-affine"]', '2');
    await page.fill('[data-testid="param-b-affine"]', '3');
    
    const errorMsg = page.locator('[data-testid="error-message-affine"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AFFINE-03 (Negative Parameters)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'HELLO');
    await page.fill('[data-testid="param-a-affine"]', '-5');
    await page.fill('[data-testid="param-b-affine"]', '-8');
    
    // -5 maps to 21 (coprime), -8 maps to 18. This should work or throw a normalization validation.
    const errorMsg = page.locator('[data-testid="error-message-affine"]');
    const outputText = await page.locator('[data-testid="output-text-affine"]').textContent();
    
    expect(await errorMsg.isHidden() || outputText !== '').toBe(true);
  });

  test('TC-T2-AFFINE-04 (Out of Bounds a/b)', async ({ page }) => {
    await page.fill('[data-testid="input-text-affine"]', 'HELLO');
    await page.fill('[data-testid="param-a-affine"]', '1001'); // coprime check
    await page.fill('[data-testid="param-b-affine"]', '2000');
    
    // 1001 % 26 = 13 (not coprime, should error) or handles it
    const errorMsg = page.locator('[data-testid="error-message-affine"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AFFINE-05 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-affine"]', invalidText);
    await page.fill('[data-testid="param-a-affine"]', '5');
    await page.fill('[data-testid="param-b-affine"]', '8');
    
    const errorMsg = page.locator('[data-testid="error-message-affine"]');
    await expect(errorMsg).toBeVisible();
  });
});
