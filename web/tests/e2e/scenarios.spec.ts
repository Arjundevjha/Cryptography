import { test, expect } from '@playwright/test';
import { openExhibit, executeCipher } from './helpers';

test.describe('Tier 4: Real-World Application Scenarios E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-T4-SCENARIO-01: Multi-Stage Classical Transmission', async ({ page }) => {
    // 1. Caesar Encrypt
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('MUSEUM VISIT AT NOON');
    await page.getByTestId('param-shift-caesar').fill('7');
    await executeCipher(page, 'caesar', 'encrypt');
    const outputCaesar = page.getByTestId('output-text-caesar');
    await expect(outputCaesar).not.toHaveText(/Result will appear here/i);
    const caesarOutput = (await outputCaesar.textContent())?.trim() || '';

    // 2. Vigenere Encrypt
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill(caesarOutput);
    await page.getByTestId('param-key-vigenere').fill('SECRET');
    await executeCipher(page, 'vigenere', 'encrypt');
    const outputVigenere = page.getByTestId('output-text-vigenere');
    await expect(outputVigenere).not.toHaveText(/Result will appear here/i);
    const vigenereOutput = (await outputVigenere.textContent())?.trim() || '';

    // 3. Scytale Encrypt
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill(vigenereOutput);
    await page.getByTestId('param-width-scytale').fill('4');
    await executeCipher(page, 'scytale', 'encrypt');
    const outputScytale = page.getByTestId('output-text-scytale');
    await expect(outputScytale).not.toHaveText(/Result will appear here/i);
    const scytaleOutput = (await outputScytale.textContent()) ?? '';

    // 4. Reverse: Scytale Decrypt
    await page.getByTestId('input-text-scytale').fill(scytaleOutput);
    await executeCipher(page, 'scytale', 'decrypt');
    await expect(outputScytale).toHaveText(vigenereOutput);

    // 5. Vigenere Decrypt
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill(vigenereOutput);
    await page.getByTestId('param-key-vigenere').fill('SECRET');
    await executeCipher(page, 'vigenere', 'decrypt');
    await expect(outputVigenere).toHaveText(caesarOutput);

    // 6. Caesar Decrypt
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill(caesarOutput);
    await page.getByTestId('param-shift-caesar').fill('7');
    await executeCipher(page, 'caesar', 'decrypt');
    await expect(outputCaesar).toHaveText('MUSEUM VISIT AT NOON');
  });

  test('TC-T4-SCENARIO-02: Modern Secure Channel Simulation', async ({ page }) => {
    // 1. RSA keygen
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toHaveCount(0);

    const aesKey = '1234567890123456';

    // 2. AES Encrypt message
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Top Secret Exhibit Document');
    await page.getByTestId('param-key-aes').fill(aesKey);
    await executeCipher(page, 'aes', 'encrypt');
    const outputAes = page.getByTestId('output-text-aes');
    await expect(outputAes).not.toHaveText(/Result will appear here/i);
    const aesCiphertext = (await outputAes.textContent())?.trim() || '';

    // 3. RSA Encrypt AES Key
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('input-text-rsa').fill(aesKey);
    await executeCipher(page, 'rsa', 'encrypt');
    const outputRsa = page.getByTestId('output-text-rsa');
    await expect(outputRsa).not.toHaveText(/Result will appear here/i);
    const encryptedKey = (await outputRsa.textContent())?.trim() || '';

    // 4. RSA Decrypt Key
    await page.getByTestId('input-text-rsa').fill(encryptedKey);
    await executeCipher(page, 'rsa', 'decrypt');
    await expect(outputRsa).toHaveText(aesKey);

    // 5. AES Decrypt ciphertext
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill(aesCiphertext);
    await page.getByTestId('param-key-aes').fill(aesKey);
    await executeCipher(page, 'aes', 'decrypt');
    await expect(outputAes).toHaveText('Top Secret Exhibit Document');
  });

  test('TC-T4-SCENARIO-03: Museum 2D Map Wing Navigation', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await expect(page.getByTestId('exhibit-enigma')).toBeVisible();

    await openExhibit(page, /AES Vault/i, 'aes');
    await expect(page.getByTestId('exhibit-aes')).toBeVisible();
  });

  test('TC-T4-SCENARIO-04: Database Integrity Simulation', async ({ page }) => {
    const entryText = 'ID: 1001, Name: Gold Mask, Value: Priceless';
    const modifiedText = 'ID: 1001, Name: Gold Mask, Value: PricelesS';

    // 1. SHA-256 original
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill(entryText);
    await executeCipher(page, 'sha256', 'encrypt');
    const outputSha = page.getByTestId('output-text-sha256');
    await expect(outputSha).toHaveText(/^[a-f0-9]{64}$/);
    const origHash = (await outputSha.textContent())?.trim() || '';

    // 2. AES Encrypt original
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill(entryText);
    await page.getByTestId('param-key-aes').fill('DB_KEY_SECURE_99');
    await executeCipher(page, 'aes', 'encrypt');
    const outputAes = page.getByTestId('output-text-aes');
    await expect(outputAes).not.toHaveText(/Result will appear here/i);
    const aesCiphertext = (await outputAes.textContent())?.trim() || '';

    // 3. SHA-256 modified
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill(modifiedText);
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(outputSha).toHaveText(/^[a-f0-9]{64}$/);
    await expect(outputSha).not.toHaveText(origHash);

    // 4. AES Encrypt & Decrypt modified
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill(modifiedText);
    await page.getByTestId('param-key-aes').fill('DB_KEY_SECURE_99');
    const prevAesOutput = (await outputAes.textContent())?.trim() || '';
    await executeCipher(page, 'aes', 'encrypt');
    await expect(outputAes).not.toHaveText(/Result will appear here/i);
    if (prevAesOutput) {
      await expect(outputAes).not.toHaveText(prevAesOutput);
    }
    await expect(outputAes).not.toHaveText(aesCiphertext);
    const newAesCiphertext = (await outputAes.textContent())?.trim() || '';

    await page.getByTestId('input-text-aes').fill(newAesCiphertext);
    await executeCipher(page, 'aes', 'decrypt');
    await expect(outputAes).toHaveText(modifiedText);
  });

  test('TC-T4-SCENARIO-05: Enigma Operational Simulation', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByLabel('Enigma Rotor 1').selectOption('I');
    await page.getByLabel('Enigma Rotor 2').selectOption('II');
    await page.getByLabel('Enigma Rotor 3').selectOption('III');
    await page.getByTestId('param-positions-enigma').fill('MCK');
    await page.getByTestId('param-rings-enigma').fill('OPQ');
    await page.getByTestId('param-plugboard-enigma').fill('AD FT LY UX');
    await page.getByTestId('input-text-enigma').fill('CONGRATULATIONS');
    await executeCipher(page, 'enigma', 'encrypt');

    const outputLocator = page.getByTestId('output-text-enigma');
    await expect(outputLocator).not.toHaveText(/Result will appear here/i);
    const outputText = (await outputLocator.textContent())?.trim() || '';

    await page.getByTestId('param-positions-enigma').fill('MCK');
    await page.getByTestId('input-text-enigma').fill(outputText);
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(outputLocator).toHaveText('CONGRATULATIONS');
  });

  test('TC-T4-SCENARIO-06: Double-Encryption Comparison', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    const output = page.getByTestId('output-text-caesar');
    await expect(output).toHaveText('KHOOR');

    await page.getByTestId('input-text-caesar').fill('KHOOR');
    await page.getByTestId('param-shift-caesar').fill('4');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(output).toHaveText('OLSSV');

    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('7');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(output).toHaveText('OLSSV');
  });

  test('TC-T4-SCENARIO-07: Large Input Stress Test', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    const largeText = 'a'.repeat(500);
    await page.getByTestId('input-text-caesar').fill(largeText);
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('exhibit-caesar').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-caesar')).toHaveText('d'.repeat(500));
  });

  test('TC-T4-SCENARIO-08: Caesar Brute-Force Simulation', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('KHOOR');
    await page.getByTestId('decrypt-btn-caesar').click();

    let decryptedText = '';
    const outputLocator = page.getByTestId('output-text-caesar');
    for (let shift = 1; shift <= 5; shift++) {
      await page.getByTestId('param-shift-caesar').fill(shift.toString());
      await executeCipher(page, 'caesar');
      await expect(outputLocator).not.toHaveText(/Result will appear here/i);
      const outputText = (await outputLocator.textContent())?.trim() || '';
      if (outputText === 'HELLO') {
        decryptedText = outputText;
        break;
      }
    }
    expect(decryptedText).toBe('HELLO');
  });

  test('TC-T4-SCENARIO-09: Signed Key Exchange', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('47');
    await page.getByTestId('param-q-rsa').fill('59');
    await page.getByTestId('generate-keys-btn-rsa').click();

    const symKey = '1234567890123456';
    await page.getByTestId('input-text-rsa').fill(symKey);
    await executeCipher(page, 'rsa', 'encrypt');
    const outputRsa = page.getByTestId('output-text-rsa');
    await expect(outputRsa).not.toHaveText(/Result will appear here/i);

    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill(symKey);
    await executeCipher(page, 'sha256', 'encrypt');
    const outputSha = page.getByTestId('output-text-sha256');
    await expect(outputSha).toHaveText(/^[a-f0-9]{64}$/);
    const keyHash = (await outputSha.textContent())?.trim() || '';

    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('input-text-rsa').fill(keyHash);
    await executeCipher(page, 'rsa', 'encrypt');
    await expect(outputRsa).not.toHaveText(/Result will appear here/i);
  });
});
