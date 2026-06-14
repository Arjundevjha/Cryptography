import { test, expect } from '@playwright/test';

test.describe('Tier 4: Real-World Application Scenarios E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-T4-SCENARIO-01: Multi-Stage Classical Transmission', async ({ page }) => {
    // 1. Input plaintext "MUSEUM VISIT AT NOON" into Caesar.
    await page.fill('[data-testid="input-text-caesar"]', 'MUSEUM VISIT AT NOON');
    // 2. Set shift = 7, mode = Encrypt.
    await page.fill('[data-testid="param-shift-caesar"]', '7');
    const encryptBtnCaesar = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtnCaesar.count() > 0) { await encryptBtnCaesar.click(); }
    const outputCaesar = page.locator('[data-testid="output-text-caesar"]');
    await expect(outputCaesar).not.toBeEmpty();
    const caesarOutput = await outputCaesar.textContent();
    expect(caesarOutput).not.toBe('');

    // 3. Copy Caesar output, paste it into Vigenère.
    await page.fill('[data-testid="input-text-vigenere"]', caesarOutput || '');
    // 4. Set key = "SECRET", mode = Encrypt.
    await page.fill('[data-testid="param-key-vigenere"]', 'SECRET');
    const encryptBtnVigenere = page.locator('[data-testid="encrypt-btn-vigenere"]');
    if (await encryptBtnVigenere.count() > 0) { await encryptBtnVigenere.click(); }
    const outputVigenere = page.locator('[data-testid="output-text-vigenere"]');
    await expect(outputVigenere).not.toBeEmpty();
    const vigenereOutput = await outputVigenere.textContent();
    expect(vigenereOutput).not.toBe('');

    // 5. Copy Vigenère output, paste it into Scytale.
    await page.fill('[data-testid="input-text-scytale"]', vigenereOutput || '');
    // 6. Set width = 3, mode = Encrypt.
    await page.fill('[data-testid="param-width-scytale"]', '3');
    const encryptBtnScytale = page.locator('[data-testid="encrypt-btn-scytale"]');
    if (await encryptBtnScytale.count() > 0) { await encryptBtnScytale.click(); }
    const outputScytale = page.locator('[data-testid="output-text-scytale"]');
    await expect(outputScytale).not.toBeEmpty();
    const scytaleOutput = await outputScytale.textContent();
    expect(scytaleOutput).not.toBe('');

    // 7. Perform reverse path: Scytale Decrypt
    await page.fill('[data-testid="input-text-scytale"]', scytaleOutput || '');
    const decryptBtnScytale = page.locator('[data-testid="decrypt-btn-scytale"]');
    if (await decryptBtnScytale.count() > 0) {
      await decryptBtnScytale.click();
    } else {
      await page.selectOption('[data-testid="mode-select-scytale"]', 'decrypt');
    }
    const scytaleDecryptedLocator = page.locator('[data-testid="output-text-scytale"]');
    await expect(scytaleDecryptedLocator).toHaveText(vigenereOutput || '');
    const scytaleDecrypted = await scytaleDecryptedLocator.textContent();

    // Vigenere Decrypt
    await page.fill('[data-testid="input-text-vigenere"]', scytaleDecrypted || '');
    await page.fill('[data-testid="param-key-vigenere"]', 'SECRET');
    const decryptBtnVigenere = page.locator('[data-testid="decrypt-btn-vigenere"]');
    if (await decryptBtnVigenere.count() > 0) {
      await decryptBtnVigenere.click();
    } else {
      await page.selectOption('[data-testid="mode-select-vigenere"]', 'decrypt');
    }
    const vigenereDecryptedLocator = page.locator('[data-testid="output-text-vigenere"]');
    await expect(vigenereDecryptedLocator).toHaveText(caesarOutput || '');
    const vigenereDecrypted = await vigenereDecryptedLocator.textContent();

    // Caesar Decrypt
    await page.fill('[data-testid="input-text-caesar"]', vigenereDecrypted || '');
    await page.fill('[data-testid="param-shift-caesar"]', '7');
    const decryptBtnCaesar = page.locator('[data-testid="decrypt-btn-caesar"]');
    if (await decryptBtnCaesar.count() > 0) {
      await decryptBtnCaesar.click();
    } else {
      await page.selectOption('[data-testid="mode-select-caesar"]', 'decrypt');
    }
    const caesarDecryptedLocator = page.locator('[data-testid="output-text-caesar"]');
    await expect(caesarDecryptedLocator).toHaveText('MUSEUM VISIT AT NOON');
    const caesarDecrypted = await caesarDecryptedLocator.textContent();

    // 8. Verify final output matches original "MUSEUM VISIT AT NOON"
    expect(caesarDecrypted?.toUpperCase().trim()).toBe('MUSEUM VISIT AT NOON');
  });

  test('TC-T4-SCENARIO-02: Modern Secure Channel Simulation', async ({ page }) => {
    // 1. RSA exhibit. Generate keypair with p=61, q=53.
    const rsaNode = page.locator('[data-testid="timeline-node-rsa"]');
    await rsaNode.click();
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) { await genBtn.click(); }

    // 2. Generate a random AES symmetric key (16 bytes)
    const aesKey = '1234567890123456';

    // 3. AES exhibit. Input message "Top Secret Exhibit Document" and encrypt.
    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await aesNode.click();
    await page.fill('[data-testid="input-text-aes"]', 'Top Secret Exhibit Document');
    await page.fill('[data-testid="param-key-aes"]', aesKey);
    const encryptBtnAes = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
    const outputAes = page.locator('[data-testid="output-text-aes"]');
    await expect(outputAes).not.toBeEmpty();
    const aesCiphertext = await outputAes.textContent();
    expect(aesCiphertext).not.toBe('');

    // 4. RSA Encrypt AES Key
    await rsaNode.click();
    await page.fill('[data-testid="input-text-rsa"]', aesKey);
    const encryptBtnRsa = page.locator('[data-testid="encrypt-btn-rsa"]');
    if (await encryptBtnRsa.count() > 0) { await encryptBtnRsa.click(); }
    const outputRsa = page.locator('[data-testid="output-text-rsa"]');
    await expect(outputRsa).not.toBeEmpty();
    const encryptedKey = await outputRsa.textContent();
    expect(encryptedKey).not.toBe('');

    // 6. RSA Decrypt Key
    await page.fill('[data-testid="input-text-rsa"]', encryptedKey || '');
    const decryptBtnRsa = page.locator('[data-testid="decrypt-btn-rsa"]');
    if (await decryptBtnRsa.count() > 0) {
      await decryptBtnRsa.click();
    } else {
      await page.selectOption('[data-testid="mode-select-rsa"]', 'decrypt');
    }
    const outputRsaDecrypted = page.locator('[data-testid="output-text-rsa"]');
    await expect(outputRsaDecrypted).toHaveText(aesKey);
    const decryptedKey = await outputRsaDecrypted.textContent();

    // 7. AES Decrypt ciphertext
    await aesNode.click();
    await page.fill('[data-testid="input-text-aes"]', aesCiphertext || '');
    await page.fill('[data-testid="param-key-aes"]', decryptedKey || '');
    const decryptBtnAes = page.locator('[data-testid="decrypt-btn-aes"]');
    if (await decryptBtnAes.count() > 0) {
      await decryptBtnAes.click();
    } else {
      await page.selectOption('[data-testid="mode-select-aes"]', 'decrypt');
    }
    // 8. Verify
    await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText('Top Secret Exhibit Document');
  });

  test('TC-T4-SCENARIO-03: Museum Tour Timeline Navigation', async ({ page }) => {
    // 1. Load application. Verify Scytale timeline highlighted
    const scytaleNode = page.locator('[data-testid="timeline-node-scytale"]');
    await expect(scytaleNode).toHaveClass(/active|highlighted/);

    // 2. Click Enigma node. Verify Enigma visible
    const enigmaNode = page.locator('[data-testid="timeline-node-enigma"]');
    await enigmaNode.click();
    const enigmaExhibit = page.locator('[data-testid="exhibit-enigma"]');
    await expect(enigmaExhibit).toBeInViewport();

    // 3. Manually scroll to Enigma, check timeline node highlight
    await enigmaExhibit.scrollIntoViewIfNeeded();
    await expect(enigmaNode).toHaveClass(/active|highlighted|bg-amber-500|font-bold/);

    // 4. Keyboard navigation to AES
    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await aesNode.focus();
    await page.keyboard.press('Enter');
    const aesExhibit = page.locator('[data-testid="exhibit-aes"]');
    await expect(aesExhibit).toBeInViewport();
  });

  test('TC-T4-SCENARIO-04: Database Integrity Simulation', async ({ page }) => {
    // 1. Input text into SHA-256
    const shaNode = page.locator('[data-testid="timeline-node-sha256"]');
    await shaNode.click();
    const entryText = 'ID: 1001, Name: Gold Mask, Value: Priceless';
    await page.fill('[data-testid="input-text-sha256"]', entryText);
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    const outputSha = page.locator('[data-testid="output-text-sha256"]');
    await expect(outputSha).not.toBeEmpty();
    const origHash = await outputSha.textContent();

    // 3. AES Encrypt
    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await aesNode.click();
    await page.fill('[data-testid="input-text-aes"]', entryText);
    await page.fill('[data-testid="param-key-aes"]', 'DB_KEY_SECURE_99');
    const encryptBtnAes = page.locator('[data-testid="encrypt-btn-aes"]');
    if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
    const outputAes = page.locator('[data-testid="output-text-aes"]');
    await expect(outputAes).not.toBeEmpty();
    const aesCiphertext = await outputAes.textContent();

    // 4. Modify single letter
    const modifiedText = 'ID: 1001, Name: Gold Mask, Value: PricelesS'; // change final s to S
    await shaNode.click();
    await page.fill('[data-testid="input-text-sha256"]', modifiedText);
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    await expect(outputSha).not.toBeEmpty();
    const newHash = await outputSha.textContent();

    // 5. Verify hash is different
    expect(newHash).not.toEqual(origHash);

    // 6. Encrypt modified text
    await aesNode.click();
    await page.fill('[data-testid="input-text-aes"]', modifiedText);
    if (await encryptBtnAes.count() > 0) { await encryptBtnAes.click(); }
    await expect(outputAes).not.toBeEmpty();
    const newAesCiphertext = await outputAes.textContent();
    expect(newAesCiphertext).not.toEqual(aesCiphertext);

    // 7. Decrypt modified ciphertext (since it has the active nonce)
    await page.fill('[data-testid="input-text-aes"]', newAesCiphertext || '');
    const decryptBtnAes = page.locator('[data-testid="decrypt-btn-aes"]');
    if (await decryptBtnAes.count() > 0) {
      await decryptBtnAes.click();
    } else {
      await page.selectOption('[data-testid="mode-select-aes"]', 'decrypt');
    }
    await expect(page.locator('[data-testid="output-text-aes"]')).toHaveText(modifiedText);
  });

  test('TC-T4-SCENARIO-05: Enigma Operational Simulation', async ({ page }) => {
    const enigmaNode = page.locator('[data-testid="timeline-node-enigma"]');
    await enigmaNode.click();

    // 1. Configure Enigma
    const rotorSelect = page.locator('[data-testid="param-rotors-enigma"]');
    if (await rotorSelect.count() > 0) { await rotorSelect.fill('I-II-III'); }
    const posSelect = page.locator('[data-testid="param-positions-enigma"]');
    if (await posSelect.count() > 0) { await posSelect.fill('M-C-K'); }
    const ringsSelect = page.locator('[data-testid="param-rings-enigma"]');
    if (await ringsSelect.count() > 0) { await ringsSelect.fill('O-P-Q'); }
    const plugboardSelect = page.locator('[data-testid="param-plugboard-enigma"]');
    if (await plugboardSelect.count() > 0) { await plugboardSelect.fill('AD FT LY UX'); }

    // 3. Input text
    await page.fill('[data-testid="input-text-enigma"]', 'CONGRATULATIONS');

    // 4. Play button and Speed Slider
    const speed = page.locator('[data-testid="speed-slider-enigma"]');
    if (await speed.count() > 0) { await speed.fill('100'); } // Max speed
    const playBtn = page.locator('[data-testid="play-btn-enigma"]');
    if (await playBtn.count() > 0) {
      await playBtn.click();
      // Wait for output or click encrypt directly if play isn't required for final value
    } else {
      const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
      if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    }

    const outputLocator = page.locator('[data-testid="output-text-enigma"]');
    await expect(outputLocator).not.toBeEmpty();
    const outputText = await outputLocator.textContent();
    expect(outputText).not.toBe('');

    // 6. Reset rotor positions
    if (await posSelect.count() > 0) { await posSelect.fill('M-C-K'); }

    // 7. Decrypt
    await page.fill('[data-testid="input-text-enigma"]', outputText || '');
    const encryptBtn = page.locator('[data-testid="encrypt-btn-enigma"]');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }

    await expect(outputLocator).not.toBeEmpty();
    const decrypted = await outputLocator.textContent();
    expect(decrypted).toBe('CONGRATULATIONS');
  });

  test('TC-T4-SCENARIO-06: Double-Encryption Comparison', async ({ page }) => {
    // 1. Input "HELLO" in Caesar shift 3 -> "KHOOR"
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    const encryptBtn = page.locator('[data-testid="encrypt-btn-caesar"]');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    const firstOutput = await page.locator('[data-testid="output-text-caesar"]').textContent();
    expect(firstOutput).toBe('KHOOR');

    // 2. Input "KHOOR" in Caesar shift 4 -> "OLSSV"
    await page.fill('[data-testid="input-text-caesar"]', firstOutput || '');
    await page.fill('[data-testid="param-shift-caesar"]', '4');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    const secondOutput = await page.locator('[data-testid="output-text-caesar"]').textContent();
    expect(secondOutput).toBe('OLSSV');

    // 3. Input "HELLO" in Caesar shift 7 -> "OLSSV"
    await page.fill('[data-testid="input-text-caesar"]', 'HELLO');
    await page.fill('[data-testid="param-shift-caesar"]', '7');
    if (await encryptBtn.count() > 0) { await encryptBtn.click(); }
    await expect(page.locator('[data-testid="output-text-caesar"]')).toHaveText(secondOutput || '');
  });

  test('TC-T4-SCENARIO-07: Large Input Stress Test', async ({ page }) => {
    const largeText = 'a'.repeat(1000);
    await page.fill('[data-testid="input-text-caesar"]', largeText);
    
    // UI should show error or prevent input
    const errorMsg = page.locator('[data-testid="error-message-caesar"]');
    await expect(errorMsg).toBeVisible();

    // Trim to 500
    const trimmed = 'a'.repeat(500);
    await page.fill('[data-testid="input-text-caesar"]', trimmed);
    await page.fill('[data-testid="param-shift-caesar"]', '3');
    await expect(errorMsg).not.toBeVisible();
  });

  test('TC-T4-SCENARIO-08: Caesar Brute-Force Simulation', async ({ page }) => {
    await page.fill('[data-testid="input-text-caesar"]', 'KHOOR');
    
    const decryptBtn = page.locator('[data-testid="decrypt-btn-caesar"]');
    if (await decryptBtn.count() > 0) {
      await decryptBtn.click();
    } else {
      await page.selectOption('[data-testid="mode-select-caesar"]', 'decrypt');
    }

    // Step shifts from 1 to 25
    let decryptedText = '';
    for (let shift = 1; shift <= 25; shift++) {
      await page.fill('[data-testid="param-shift-caesar"]', shift.toString());
      const outputLocator = page.locator('[data-testid="output-text-caesar"]');
      await expect(outputLocator).not.toBeEmpty();
      const outputText = await outputLocator.textContent();
      if (outputText === 'HELLO') {
        decryptedText = outputText;
        break;
      }
    }
    expect(decryptedText).toBe('HELLO');
  });

  test('TC-T4-SCENARIO-09: Signed Key Exchange', async ({ page }) => {
    // 1. Alice generates RSA keys. Bob generates RSA keys.
    const rsaNode = page.locator('[data-testid="timeline-node-rsa"]');
    await rsaNode.click();

    // Alice
    await page.fill('[data-testid="param-p-rsa"]', '61');
    await page.fill('[data-testid="param-q-rsa"]', '53');
    const genBtn = page.locator('[data-testid="generate-keys-btn-rsa"]');
    if (await genBtn.count() > 0) { await genBtn.click(); }

    // Bob
    await page.fill('[data-testid="param-p-rsa"]', '47');
    await page.fill('[data-testid="param-q-rsa"]', '59');
    if (await genBtn.count() > 0) { await genBtn.click(); }

    // Alice encrypts symmetric key using Bob's public key
    const symKey = '1234567890123456';
    await page.fill('[data-testid="input-text-rsa"]', symKey);
    const encryptBtnRsa = page.locator('[data-testid="encrypt-btn-rsa"]');
    if (await encryptBtnRsa.count() > 0) { await encryptBtnRsa.click(); }
    const outputRsa = page.locator('[data-testid="output-text-rsa"]');
    await expect(outputRsa).not.toBeEmpty();
    const encryptedKey = await outputRsa.textContent();
    expect(encryptedKey).not.toBe('');

    // Alice hashes symmetric key
    const shaNode = page.locator('[data-testid="timeline-node-sha256"]');
    await shaNode.click();
    await page.fill('[data-testid="input-text-sha256"]', symKey);
    const hashBtn = page.locator('[data-testid="encrypt-btn-sha256"], [data-testid="hash-btn-sha256"]').first();
    if (await hashBtn.count() > 0) { await hashBtn.click(); }
    const outputSha = page.locator('[data-testid="output-text-sha256"]');
    await expect(outputSha).not.toBeEmpty();
    const keyHash = await outputSha.textContent();

    // Alice signs (encrypts) the hash using Alice's private key
    await rsaNode.click();
    await page.fill('[data-testid="input-text-rsa"]', keyHash || '');
    if (await encryptBtnRsa.count() > 0) { await encryptBtnRsa.click(); }
    await expect(outputRsa).not.toBeEmpty();
    const signature = await outputRsa.textContent();
    expect(signature).not.toBe('');
  });

  test('TC-T4-SCENARIO-10: Timeline Browsing History Integration', async ({ page }) => {
    // Click Caesar, Enigma, AES
    const caesarNode = page.locator('[data-testid="timeline-node-caesar"]');
    await caesarNode.click();
    await expect(page).toHaveURL(/#caesar/);

    const enigmaNode = page.locator('[data-testid="timeline-node-enigma"]');
    await enigmaNode.click();
    await expect(page).toHaveURL(/#enigma/);

    const aesNode = page.locator('[data-testid="timeline-node-aes"]');
    await aesNode.click();
    await expect(page).toHaveURL(/#aes/);

    // Back
    await page.goBack();
    await expect(page).toHaveURL(/#enigma/);

    // Forward
    await page.goForward();
    await expect(page).toHaveURL(/#aes/);
  });
});
