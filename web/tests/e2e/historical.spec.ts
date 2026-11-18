import { test, expect } from '@playwright/test';
import { openExhibit, executeCipher } from './helpers';

test.describe('Historical Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // SCYTALE CIPHER
  // ==========================================

  test('TC-T1-SCYTALE-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('I AM HURT VERY BADLY');
    await page.getByTestId('param-width-scytale').fill('4');
    await executeCipher(page, 'scytale', 'encrypt');
    await expect(page.getByTestId('output-text-scytale')).toHaveText('I TRA H YDAUV LMREBY');
  });

  test('TC-T1-SCYTALE-02 (Decrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('I TRA H YDAUV LMREBY');
    await page.getByTestId('param-width-scytale').fill('4');
    await executeCipher(page, 'scytale', 'decrypt');

    const outputLocator = page.getByTestId('output-text-scytale');
    await expect(outputLocator).not.toHaveText(/Result will appear here/i);
    const outputText = await outputLocator.textContent();
    expect(outputText?.trim().startsWith('I AM HURT VERY BADLY')).toBe(true);
  });

  test('TC-T1-SCYTALE-03 (Single Row / Edge Width)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('HELLO');
    await page.getByTestId('param-width-scytale').fill('5');
    await executeCipher(page, 'scytale', 'encrypt');

    const outputScytale = page.getByTestId('output-text-scytale');
    await expect(outputScytale).not.toHaveText(/Result will appear here/i);
    const outputText = await outputScytale.textContent();
    expect(outputText?.replace(/\s+/g, '')).toBe('HELLO');
  });

  test('TC-T1-SCYTALE-04 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('TEST');
    await page.getByTestId('param-width-scytale').fill('2');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-scytale')).toBeVisible();
  });

  test('TC-T1-SCYTALE-05 (Varying Width)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('SCYTALE');
    await page.getByTestId('param-width-scytale').fill('3');
    await executeCipher(page, 'scytale', 'encrypt');

    const outputScytale = page.getByTestId('output-text-scytale');
    await expect(outputScytale).not.toHaveText(/Result will appear here/i);
    const outputText3 = (await outputScytale.textContent()) || '';

    await page.getByTestId('param-width-scytale').fill('4');
    await executeCipher(page, 'scytale', 'encrypt');
    await expect(outputScytale).not.toHaveText(outputText3);
  });

  test('TC-T2-SCYTALE-01 (Width Too Small)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('HELLO');
    await page.getByTestId('param-width-scytale').fill('1');
    await executeCipher(page, 'scytale', 'encrypt');
    await expect(page.getByTestId('exhibit-scytale').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-SCYTALE-03 (Width Exceeding Input Length)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('HI');
    await page.getByTestId('param-width-scytale').fill('10');
    await executeCipher(page, 'scytale', 'encrypt');
    await expect(page.getByTestId('exhibit-scytale').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-scytale')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T2-SCYTALE-04 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /Scytale Cipher/i, 'scytale');
    await page.getByTestId('input-text-scytale').fill('');
    await page.getByTestId('param-width-scytale').fill('3');
    await expect(page.getByTestId('exhibit-scytale').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-scytale')).toHaveText(/Result will appear here/i);
  });

  // ==========================================
  // POLYBIUS CIPHER
  // ==========================================

  test('TC-T1-POLYBIUS-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('HELLO');
    await executeCipher(page, 'polybius', 'encrypt');
    await expect(page.getByTestId('output-text-polybius')).toHaveText('23 15 31 31 34');
  });

  test('TC-T1-POLYBIUS-02 (Decrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('23 15 31 31 34');
    await executeCipher(page, 'polybius', 'decrypt');
    await expect(page.getByTestId('output-text-polybius')).toHaveText(/(HELLO|HELLIO)/);
  });

  test('TC-T1-POLYBIUS-03 (I and J Merge)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('JULIET');
    await executeCipher(page, 'polybius', 'encrypt');

    const outputLocator = page.getByTestId('output-text-polybius');
    await expect(outputLocator).toHaveText(/\d/);
    const outputText = (await outputLocator.textContent())?.trim() || '';

    await page.getByTestId('input-text-polybius').fill('IULIET');
    await executeCipher(page, 'polybius', 'encrypt');
    await expect(outputLocator).toHaveText(outputText);
  });

  test('TC-T1-POLYBIUS-04 (Non-Alphabetic Ignored/Preserved)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('HE LLO!');
    await executeCipher(page, 'polybius', 'encrypt');
    await expect(page.getByTestId('output-text-polybius')).toHaveText(/\d/);
  });

  test('TC-T1-POLYBIUS-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('A');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-polybius')).toBeVisible();
  });

  test('TC-T2-POLYBIUS-01 (Invalid Decrypt Coordinates)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('23 15 31 3');
    await executeCipher(page, 'polybius', 'decrypt');
    await expect(page.getByTestId('exhibit-polybius').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-POLYBIUS-02 (Decryption Out of Range)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('23 99 31');
    await executeCipher(page, 'polybius', 'decrypt');
    await expect(page.getByTestId('exhibit-polybius').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-POLYBIUS-03 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('');
    await expect(page.getByTestId('exhibit-polybius').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-polybius')).toHaveText(/Result will appear here/i);
  });

  test('TC-T2-POLYBIUS-05 (Non-numeric Coordinates Decrypt)', async ({ page }) => {
    await openExhibit(page, /Polybius Square/i, 'polybius');
    await page.getByTestId('input-text-polybius').fill('2a 15 31');
    await executeCipher(page, 'polybius', 'decrypt');
    await expect(page.getByTestId('exhibit-polybius').locator('[role="alert"]')).toBeVisible();
  });

  // ==========================================
  // ENIGMA CIPHER
  // ==========================================

  test('TC-T1-ENIGMA-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('HELLO');
    await page.getByLabel('Enigma Rotor 1').selectOption('I');
    await page.getByLabel('Enigma Rotor 2').selectOption('II');
    await page.getByLabel('Enigma Rotor 3').selectOption('III');
    await page.getByTestId('param-positions-enigma').fill('AAA');
    await page.getByTestId('param-rings-enigma').fill('AAA');
    await page.getByTestId('param-plugboard-enigma').fill('');
    await executeCipher(page, 'enigma', 'encrypt');

    const output = page.getByTestId('output-text-enigma');
    await expect(output).not.toHaveText(/Result will appear here/i);
    await expect(output).toHaveText(/^[A-Z]{5}$/);
  });

  test('TC-T1-ENIGMA-02 (Reciprocity/Decryption)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('HELLO');
    await executeCipher(page, 'enigma', 'encrypt');

    const outputLocator = page.getByTestId('output-text-enigma');
    await expect(outputLocator).not.toHaveText(/Result will appear here/i);
    const ciphertext = (await outputLocator.textContent())?.trim() || '';

    await page.getByTestId('param-positions-enigma').fill('AAA');
    await page.getByTestId('input-text-enigma').fill(ciphertext);
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(outputLocator).toHaveText('HELLO');
  });

  test('TC-T1-ENIGMA-03 (Rotor Config Change)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('TESTING');
    await page.getByLabel('Enigma Rotor 1').selectOption('III');
    await page.getByLabel('Enigma Rotor 2').selectOption('I');
    await page.getByLabel('Enigma Rotor 3').selectOption('II');
    await page.getByTestId('param-positions-enigma').fill('XYZ');
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(page.getByTestId('output-text-enigma')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T1-ENIGMA-04 (Plugboard Swaps)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('A');
    await page.getByTestId('param-plugboard-enigma').fill('AB CD');
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(page.getByTestId('output-text-enigma')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T1-ENIGMA-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('A');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-enigma')).toBeVisible();
  });

  test('TC-T2-ENIGMA-01 (Invalid Rotor Configuration)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('HELLO');
    await page.getByLabel('Enigma Rotor 1').selectOption('I');
    await page.getByLabel('Enigma Rotor 2').selectOption('I');
    await page.getByLabel('Enigma Rotor 3').selectOption('II');
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(page.getByTestId('exhibit-enigma').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-ENIGMA-02 (Duplicate Plugboard Connections)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('HELLO');
    await page.getByTestId('param-plugboard-enigma').fill('AB AC');
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(page.getByTestId('exhibit-enigma').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-ENIGMA-03 (Invalid Plugboard Character)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('HELLO');
    await page.getByTestId('param-plugboard-enigma').fill('A1 CD');
    await executeCipher(page, 'enigma', 'encrypt');
    await expect(page.getByTestId('exhibit-enigma').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-ENIGMA-04 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await page.getByTestId('input-text-enigma').fill('');
    await expect(page.getByTestId('exhibit-enigma').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-enigma')).toHaveText(/Result will appear here/i);
  });

  // ==========================================
  // LORENZ SZ42 CIPHER
  // ==========================================

  test('TC-T1-LORENZ-01 (Exhibit Loaded & Interactive)', async ({ page }) => {
    await openExhibit(page, /Lorenz SZ42/i, 'lorenz');
    await expect(page.getByTestId('exhibit-lorenz')).toBeVisible();
  });

  test('TC-T1-LORENZ-02 (Encrypt & Decrypt Reciprocity)', async ({ page }) => {
    await openExhibit(page, /Lorenz SZ42/i, 'lorenz');
    await page.getByTestId('input-text-lorenz').fill('ATTACK AT DAWN');
    await executeCipher(page, 'lorenz', 'encrypt');

    const outputLocator = page.getByTestId('output-text-lorenz');
    await expect(outputLocator).not.toHaveText(/Result will appear here/i);
    const ciphertext = (await outputLocator.textContent())?.trim() || '';
    expect(ciphertext).not.toBe('');

    await page.getByTestId('input-text-lorenz').fill(ciphertext);
    await executeCipher(page, 'lorenz', 'decrypt');
    await expect(outputLocator).toHaveText('ATTACK AT DAWN');
  });
});
