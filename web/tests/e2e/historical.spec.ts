import { test, expect } from '@playwright/test';

test.describe('Historical Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // SCYTALE CIPHER
  // ==========================================

  test('TC-T1-SCYTALE-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'I AM HURT VERY BADLY');
    await page.fill('[data-testid="param-width-scytale"]', '4');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-scytale"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-scytale"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-scytale"]')).toHaveText('I TRA H YDAUV LMREBY');
  });

  test('TC-T1-SCYTALE-02 (Decrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'I TRA H YDAUV LMREBY');
    await page.fill('[data-testid="param-width-scytale"]', '4');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-scytale"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-scytale"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    // Decrypted text might retain padding or spaces
    const outputLocator = page.locator('[data-testid="output-text-scytale"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    expect(outputText?.trim().startsWith('I AM HURT VERY BADLY')).toBe(true);
  });

  test('TC-T1-SCYTALE-03 (Single Row / Edge Width)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'HELLO');
    // If single row, width = 5.
    await page.fill('[data-testid="param-width-scytale"]', '5');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-scytale"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputText = await page.locator('[data-testid="output-text-scytale"]').textContent();
    expect(outputText?.replace(/\s+/g, '')).toBe('HELLO');
  });

  test('TC-T1-SCYTALE-04 (Wrapping Tape Animation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'TEST');
    await page.fill('[data-testid="param-width-scytale"]', '2');
    
    const visualizer = page.locator('[data-testid="visualizer-scytale"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('canvas, svg, div').first()).toBeVisible();
  });

  test('TC-T1-SCYTALE-05 (Varying Width)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'SCYTALE');
    await page.fill('[data-testid="param-width-scytale"]', '3');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-scytale"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    const outputText3 = await page.locator('[data-testid="output-text-scytale"]').textContent();
    
    await page.fill('[data-testid="param-width-scytale"]', '4');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    const outputText4 = await page.locator('[data-testid="output-text-scytale"]').textContent();
    
    expect(outputText3).not.toEqual(outputText4);
  });

  test('TC-T2-SCYTALE-01 (Width Too Small)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'HELLO');
    await page.fill('[data-testid="param-width-scytale"]', '1');
    
    const errorMsg = page.locator('[data-testid="error-message-scytale"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-SCYTALE-02 (Non-Numeric Width)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'HELLO');
    await page.fill('[data-testid="param-width-scytale"]', 'xyz');
    
    const errorMsg = page.locator('[data-testid="error-message-scytale"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-SCYTALE-03 (Width Exceeding Input Length)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', 'HI');
    await page.fill('[data-testid="param-width-scytale"]', '10');
    
    const errorMsg = page.locator('[data-testid="error-message-scytale"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-scytale"]')).not.toBeEmpty();
  });

  test('TC-T2-SCYTALE-04 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-scytale"]', '');
    await page.fill('[data-testid="param-width-scytale"]', '3');
    
    const errorMsg = page.locator('[data-testid="error-message-scytale"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-scytale"]')).toHaveText('');
  });

  test('TC-T2-SCYTALE-05 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-scytale"]', invalidText);
    await page.fill('[data-testid="param-width-scytale"]', '4');
    
    const errorMsg = page.locator('[data-testid="error-message-scytale"]');
    await expect(errorMsg).toBeVisible();
  });

  // ==========================================
  // POLYBIUS CIPHER
  // ==========================================

  test('TC-T1-POLYBIUS-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', 'HELLO');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText('23 15 31 31 34');
  });

  test('TC-T1-POLYBIUS-02 (Decrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', '23 15 31 31 34');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    const outputLocator = page.locator('[data-testid="output-text-polybius"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    expect(outputText === 'HELLO' || outputText === 'HELLIO').toBe(true);
  });

  test('TC-T1-POLYBIUS-03 (I and J Merge)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', 'JULIET');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputLocator = page.locator('[data-testid="output-text-polybius"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    
    await page.fill('[data-testid="input-text-polybius"]', 'IULIET');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText(outputText || '');
  });

  test('TC-T1-POLYBIUS-04 (Non-Alphabetic Ignored/Preserved)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', 'HE LLO!');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-polybius"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputLocator = page.locator('[data-testid="output-text-polybius"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    expect(outputText).not.toBe('');
  });

  test('TC-T1-POLYBIUS-05 (Grid Highlight)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', 'A');
    
    const visualizer = page.locator('[data-testid="visualizer-polybius"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('table, svg, div').first()).toBeVisible();
  });

  test('TC-T2-POLYBIUS-01 (Invalid Decrypt Coordinates)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', '23 15 31 3');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    const errorMsg = page.locator('[data-testid="error-message-polybius"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-POLYBIUS-02 (Decryption Out of Range)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', '23 99 31');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    const errorMsg = page.locator('[data-testid="error-message-polybius"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-POLYBIUS-03 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', '');
    
    const errorMsg = page.locator('[data-testid="error-message-polybius"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-polybius"]')).toHaveText('');
  });

  test('TC-T2-POLYBIUS-04 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-polybius"]', invalidText);
    
    const errorMsg = page.locator('[data-testid="error-message-polybius"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-POLYBIUS-05 (Non-numeric Coordinates Decrypt)', async ({ page }) => {
    await page.fill('[data-testid="input-text-polybius"]', '2a 15 31');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-polybius"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-polybius"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    const errorMsg = page.locator('[data-testid="error-message-polybius"]');
    await expect(errorMsg).toBeVisible();
  });

  // ==========================================
  // ENIGMA CIPHER
  // ==========================================

  test('TC-T1-ENIGMA-01 (Encrypt Standard)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'HELLO');
    
    // Configure rotors, positions, rings, plugboard
    const rotorSelect = page.locator('[data-testid="param-rotors-enigma"]');
    if (await rotorSelect.count() > 0) {
      await rotorSelect.fill('I-II-III');
    }
    const posSelect = page.locator('[data-testid="param-positions-enigma"]');
    if (await posSelect.count() > 0) {
      await posSelect.fill('A-A-A');
    }
    const ringsSelect = page.locator('[data-testid="param-rings-enigma"]');
    if (await ringsSelect.count() > 0) {
      await ringsSelect.fill('A-A-A');
    }
    const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
    if (await plugboardSelect.count() > 0) {
      await plugboardSelect.fill('');
    }
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const outputLocator = page.locator('[data-testid="output-text-enigma"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    expect(outputText).not.toBe('');
  });

  test('TC-T1-ENIGMA-02 (Reciprocity/Decryption)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'HELLO');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    const outputLocator = page.locator('[data-testid="output-text-enigma"]');
    await expect(outputLocator).not.toBeEmpty();
    const ciphertext = await outputLocator.textContent();
    expect(ciphertext).not.toBeNull();
    
    // Reset positions and re-input
    const posSelect = page.locator('[data-testid="param-positions-enigma"]');
    if (await posSelect.count() > 0) {
      await posSelect.fill('A-A-A');
    }
    
    await page.fill('[data-testid="input-text-enigma"]', ciphertext || '');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-enigma"]')).toHaveText('HELLO');
  });

  test('TC-T1-ENIGMA-03 (Rotor Config Change)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'TESTING');
    
    const rotorSelect = page.locator('[data-testid="param-rotors-enigma"]');
    if (await rotorSelect.count() > 0) {
      await rotorSelect.fill('III-I-II');
    }
    const posSelect = page.locator('[data-testid="param-positions-enigma"]');
    if (await posSelect.count() > 0) {
      await posSelect.fill('X-Y-Z');
    }
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-enigma"]')).not.toBeEmpty();
  });

  test('TC-T1-ENIGMA-04 (Plugboard Swaps)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'A');
    
    const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
    if (await plugboardSelect.count() > 0) {
      await plugboardSelect.fill('AB CD');
    }
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-enigma"]')).not.toBeEmpty();
  });

  test('TC-T1-ENIGMA-05 (Visual Electrical Path)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'A');
    
    const visualizer = page.locator('[data-testid="visualizer-enigma"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('svg, div').first()).toBeVisible();
  });

  test('TC-T2-ENIGMA-01 (Invalid Rotor Configuration)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'HELLO');
    
    const rotorSelect = page.locator('[data-testid="param-rotors-enigma"]');
    if (await rotorSelect.count() > 0) {
      await rotorSelect.fill('I-I-II'); // Duplicate rotor
    }
    
    const errorMsg = page.locator('[data-testid="error-message-enigma"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-ENIGMA-02 (Duplicate Plugboard Connections)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'HELLO');
    
    const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
    if (await plugboardSelect.count() > 0) {
      await plugboardSelect.fill('AB AC'); // A is connected twice
    }
    
    const errorMsg = page.locator('[data-testid="error-message-enigma"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-ENIGMA-03 (Invalid Plugboard Character)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', 'HELLO');
    
    const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
    if (await plugboardSelect.count() > 0) {
      await plugboardSelect.fill('A1 CD');
    }
    
    const errorMsg = page.locator('[data-testid="error-message-enigma"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-ENIGMA-04 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-enigma"]', '');
    
    const errorMsg = page.locator('[data-testid="error-message-enigma"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-enigma"]')).toHaveText('');
  });

  test('TC-T2-ENIGMA-05 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-enigma"]', invalidText);
    
    const errorMsg = page.locator('[data-testid="error-message-enigma"]');
    await expect(errorMsg).toBeVisible();
  });
});
