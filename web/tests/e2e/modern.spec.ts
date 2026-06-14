import { test, expect } from '@playwright/test';

test.describe('Modern Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // AES CIPHER
  // ==========================================

  test('TC-T1-AES-01 (Encrypt AES-128)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456'); // 16 bytes
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-aes"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('encrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-aes"]')).not.toBeEmpty();
  });

  test('TC-T1-AES-02 (Decrypt AES-128)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const ciphertextLocator = page.locator('[data-testid="output-text-aes"]');
    await expect(ciphertextLocator).not.toBeEmpty();
    const ciphertext = await ciphertextLocator.textContent();
    expect(ciphertext).not.toBeNull();
    
    await page.fill('[data-testid="input-text-aes"]', ciphertext || '');
    const decryptBtn = page.locator('[data-testid="decrypt-btn-aes"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-aes"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText('Secret Message');
  });

  test('TC-T1-AES-03 (AES-256 Encrypt)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    await page.fill('[data-testid="param-key-aes"]', '12345678901234561234567890123456'); // 32 bytes
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    
    const visualizer = page.locator('[data-testid="visualizer-aes"]');
    await expect(visualizer).toBeVisible();
  });

  test('TC-T1-AES-04 (Hex vs Text Mode)', async ({ page }) => {
    const formatSelect = page.locator('[data-testid="param-format-aes"]');
    if (await formatSelect.count() > 0) {
      await formatSelect.selectOption('hex');
    }
    await page.fill('[data-testid="input-text-aes"]', '536563726574'); // Hex for "Secret"
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const encryptBtn = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    }
    await expect(page.locator('[data-testid="output-text-aes"]')).not.toBeEmpty();
  });

  test('TC-T1-AES-05 (Round Visualization)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const playBtn = page.locator('[data-testid="play-btn-aes"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    
    const visualizer = page.locator('[data-testid="visualizer-aes"]');
    await expect(visualizer).toBeVisible();
  });

  test('TC-T2-AES-01 (Invalid Key Size)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    await page.fill('[data-testid="param-key-aes"]', '12345'); // Invalid length
    
    const errorMsg = page.locator('[data-testid="error-message-aes"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AES-02 (Non-Hex Key for Hex Mode)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'Secret Message');
    const keyFormatSelect = page.locator('[data-testid="param-keyformat-aes"]');
    if (await keyFormatSelect.count() > 0) {
      await keyFormatSelect.selectOption('hex');
    }
    await page.fill('[data-testid="param-key-aes"]', 'GHIJKL'); // Invalid hex
    
    const errorMsg = page.locator('[data-testid="error-message-aes"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AES-03 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', '');
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const errorMsg = page.locator('[data-testid="error-message-aes"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText('');
  });

  test('TC-T2-AES-04 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-aes"]', invalidText);
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const errorMsg = page.locator('[data-testid="error-message-aes"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-AES-05 (Invalid Ciphertext Decryption)', async ({ page }) => {
    await page.fill('[data-testid="input-text-aes"]', 'InvalidHexFormat!');
    await page.fill('[data-testid="param-key-aes"]', '1234567890123456');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-aes"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-aes"]');
      if (await modeSelect.count() > 0) {
        await modeSelect.selectOption('decrypt');
      }
    }
    
    const errorMsg = page.locator('[data-testid="error-message-aes"]');
    await expect(errorMsg).toBeVisible();
  });

  // ==========================================
  // RSA CIPHER
  // ==========================================

  test('TC-T1-RSA-01 (Keypair Gen)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) {
      await genBtn.click();
    }
    
    await expect(page.locator('[data-testid="param-n-rsa"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="public-key-rsa"]')).not.toBeEmpty();
  });

  test('TC-T1-RSA-02 (Encrypt Message)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) { await genBtn.click(); }
    
    await page.fill('[data-testid="input-text-rsa"]', '42');
    const encryptBtn = page.locator('[data-testid="encrypt-btn-rsa"]');
    if (await encryptBtn.count() > 0) {
      await encryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-rsa"]');
      if (await modeSelect.count() > 0) { await modeSelect.selectOption('encrypt'); }
    }
    
    await expect(page.locator('[data-testid="output-text-rsa"]')).not.toBeEmpty();
  });

  test('TC-T1-RSA-03 (Decrypt Ciphertext)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) { await genBtn.click(); }
    
    await page.fill('[data-testid="input-text-rsa"]', '42');
    const encryptBtn = page.locator('[data-testid="encrypt-btn-rsa"]');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    const outputRsaLocator = page.locator('[data-testid="output-text-rsa"]');
    await expect(outputRsaLocator).not.toBeEmpty();
    const ciphertext = await outputRsaLocator.textContent();
    
    await page.fill('[data-testid="input-text-rsa"]', ciphertext || '');
    const decryptBtn = page.locator('[data-testid="decrypt-btn-rsa"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      const modeSelect = page.locator('[data-testid="mode-select-rsa"]');
      if (await modeSelect.count() > 0) { await modeSelect.selectOption('decrypt'); }
    }
    
    await expect(page.locator('[data-testid="output-text-rsa"]')).toHaveText('42');
  });

  test('TC-T1-RSA-04 (Custom e Selection)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    await page.fill('[data-testid="param-e-rsa"]', '17');
    
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) { await genBtn.click(); }
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).not.toBeVisible();
  });

  test('TC-T1-RSA-05 (Formula Visualization)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    
    const visualizer = page.locator('[data-testid="visualizer-rsa"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('text=n = p * q').first()).toBeVisible();
  });

  test('TC-T2-RSA-01 (Non-Prime Parameters)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '4');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-RSA-02 (Primes Too Small)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '2');
    await page.fill('[data-testid="param-q-rsa"]', '3');
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-RSA-03 (Coprimality Violation for e)', async ({ page }) => {
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    await page.fill('[data-testid="param-e-rsa"]', '13'); // 13 is not coprime to phi(n)=3120 (13*240 = 3120)
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-RSA-04 (Empty Input Validation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-rsa"]', '');
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).not.toBeVisible();
    await expect(page.locator('[data-testid="output-text-rsa"]')).toHaveText('');
  });

  test('TC-T2-RSA-05 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-rsa"]', invalidText);
    
    const errorMsg = page.locator('[data-testid="error-message-rsa"]');
    await expect(errorMsg).toBeVisible();
  });

  // ==========================================
  // SHA-256 CIPHER
  // ==========================================

  test('TC-T1-SHA256-01 (Hash Empty String)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', '');
    
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) {
      await hashBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-sha256"]'))
      .toHaveText('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  test('TC-T1-SHA256-02 (Hash Text)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'hello');
    
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) {
      await hashBtn.click();
    }
    
    await expect(page.locator('[data-testid="output-text-sha256"]'))
      .toHaveText('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  test('TC-T1-SHA256-03 (Varying Case Hash)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'Hello');
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    const outputLocator = page.locator('[data-testid="output-text-sha256"]');
    await expect(outputLocator).not.toBeEmpty();
    const hash1 = await outputLocator.textContent();
    
    await page.fill('[data-testid="input-text-sha256"]', 'hello');
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    await expect(outputLocator).not.toBeEmpty();
    const hash2 = await outputLocator.textContent();
    
    expect(hash1).not.toEqual(hash2);
  });

  test('TC-T1-SHA256-04 (Padding Visual Representation)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'A');
    
    const visualizer = page.locator('[data-testid="visualizer-sha256"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('text=Padding added').first()).toBeVisible();
  });

  test('TC-T1-SHA256-05 (Block Splitting)', async ({ page }) => {
    const longText = 'a'.repeat(70); // > 64 bytes
    await page.fill('[data-testid="input-text-sha256"]', longText);
    
    const visualizer = page.locator('[data-testid="visualizer-sha256"]');
    await expect(visualizer).toBeVisible();
    await expect(visualizer.locator('text=Message Blocks').first()).toBeVisible();
  });

  test('TC-T2-SHA256-01 (Empty Input Handling)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', '');
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    
    await expect(page.locator('[data-testid="output-text-sha256"]')).not.toBeEmpty();
  });

  test('TC-T2-SHA256-02 (Unicode/Emoji Inputs)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'Hello World 🌍🔒');
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    
    await expect(page.locator('[data-testid="output-text-sha256"]')).not.toBeEmpty();
  });

  test('TC-T2-SHA256-03 (Max Length Bound)', async ({ page }) => {
    const invalidText = 'a'.repeat(501);
    await page.fill('[data-testid="input-text-sha256"]', invalidText);
    
    const errorMsg = page.locator('[data-testid="error-message-sha256"]');
    await expect(errorMsg).toBeVisible();
  });

  test('TC-T2-SHA256-04 (Special Symbol Inputs)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'Hello\n\tWorld\\escape');
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    
    await expect(page.locator('[data-testid="output-text-sha256"]')).not.toBeEmpty();
  });

  test('TC-T2-SHA256-05 (Rapid Sequence Changes)', async ({ page }) => {
    await page.fill('[data-testid="input-text-sha256"]', 'a');
    await page.type('[data-testid="input-text-sha256"]', 'bcdef');
    
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    
    await expect(page.locator('[data-testid="output-text-sha256"]')).not.toBeEmpty();
  });
});
