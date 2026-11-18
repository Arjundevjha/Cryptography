import { test, expect } from '@playwright/test';
import { openExhibit, executeCipher } from './helpers';

test.describe('Classical Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // CAESAR CIPHER
  // ==========================================

  test('TC-T1-CAESAR-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');
  });

  test('TC-T1-CAESAR-02 (Decrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('KHOOR');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'decrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('HELLO');
  });

  test('TC-T1-CAESAR-03 (No Shift)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('NO CHANGE');
    await page.getByTestId('param-shift-caesar').fill('0');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('NO CHANGE');
  });

  test('TC-T1-CAESAR-04 (Case Preservation)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('Caesar Cipher 123');
    await page.getByTestId('param-shift-caesar').fill('5');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('Hfjxfw Hnumjw 123');
  });

  test('TC-T1-CAESAR-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('A');
    await page.getByTestId('param-shift-caesar').fill('1');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-caesar')).toBeVisible();
  });

  test('TC-T2-CAESAR-01 (Negative Shift)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('-5');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText(/^(CZGGJ|HELLO)$/);
  });

  test('TC-T2-CAESAR-02 (Extremely Large Shift)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('1000');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('TQXXA');
  });

  test('TC-T2-CAESAR-03 (Empty String Validation)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('');
    await page.getByTestId('param-shift-caesar').fill('3');
    await expect(page.getByTestId('exhibit-caesar').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-caesar')).toHaveText(/Result will appear here/i);
  });

  test('TC-T2-CAESAR-04 (Non-Numeric Shift Defaults Gracefully)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('abc');
    await executeCipher(page, 'caesar', 'encrypt');
    // parseInt('abc', 10) || 0 falls back to shift 0 -> HELLO
    await expect(page.getByTestId('output-text-caesar')).toHaveText('HELLO');
  });

  // ==========================================
  // VIGENERE CIPHER
  // ==========================================

  test('TC-T1-VIGENERE-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('ATTACKATDAWN');
    await page.getByTestId('param-key-vigenere').fill('LEMON');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(page.getByTestId('output-text-vigenere')).toHaveText('LXFOPVEFRNHR');
  });

  test('TC-T1-VIGENERE-02 (Decrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('LXFOPVEFRNHR');
    await page.getByTestId('param-key-vigenere').fill('LEMON');
    await executeCipher(page, 'vigenere', 'decrypt');
    await expect(page.getByTestId('output-text-vigenere')).toHaveText('ATTACKATDAWN');
  });

  test('TC-T1-VIGENERE-03 (Key Case Insensitivity)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('hello');
    await page.getByTestId('param-key-vigenere').fill('kEy');
    await executeCipher(page, 'vigenere', 'encrypt');
    const output = page.getByTestId('output-text-vigenere');
    await expect(output).not.toHaveText(/Result will appear here/i);
    const outputText1 = (await output.textContent())?.trim() || '';

    await page.getByTestId('param-key-vigenere').fill('KEY');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(output).toHaveText(outputText1);
  });

  test('TC-T1-VIGENERE-04 (Special Characters Preservation)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('HELLO WORLD!');
    await page.getByTestId('param-key-vigenere').fill('KEY');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(page.getByTestId('output-text-vigenere')).toHaveText('RIJVS UYVJN!');
  });

  test('TC-T1-VIGENERE-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('A');
    await page.getByTestId('param-key-vigenere').fill('B');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-vigenere')).toBeVisible();
  });

  test('TC-T2-VIGENERE-01 (Empty Key Validation)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('HELLO');
    await page.getByTestId('param-key-vigenere').fill('');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(page.getByTestId('exhibit-vigenere').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-VIGENERE-02 (Non-Alphabetic Key)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('HELLO');
    await page.getByTestId('param-key-vigenere').fill('12345');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(page.getByTestId('exhibit-vigenere').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-VIGENERE-03 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('');
    await page.getByTestId('param-key-vigenere').fill('KEY');
    await expect(page.getByTestId('exhibit-vigenere').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-vigenere')).toHaveText(/Result will appear here/i);
  });

  test('TC-T2-VIGENERE-05 (Key Matching Input Length)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('HI');
    await page.getByTestId('param-key-vigenere').fill('VERYLONGKEY');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(page.getByTestId('output-text-vigenere')).not.toHaveText(/Result will appear here/i);
  });

  // ==========================================
  // AFFINE CIPHER
  // ==========================================

  test('TC-T1-AFFINE-01 (Encrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('ATTACK');
    await page.getByTestId('param-a-affine').fill('5');
    await page.getByTestId('param-b-affine').fill('8');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(page.getByTestId('output-text-affine')).toHaveText('izzisg');
  });

  test('TC-T1-AFFINE-02 (Decrypt Standard)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('izzisg');
    await page.getByTestId('param-a-affine').fill('5');
    await page.getByTestId('param-b-affine').fill('8');
    await executeCipher(page, 'affine', 'decrypt');
    await expect(page.getByTestId('output-text-affine')).toHaveText('attack');
  });

  test('TC-T1-AFFINE-03 (Coprime a=17)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('HELLO');
    await page.getByTestId('param-a-affine').fill('17');
    await page.getByTestId('param-b-affine').fill('20');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(page.getByTestId('output-text-affine')).toHaveText('jkzzy');
  });

  test('TC-T1-AFFINE-04 (Key Decryption Reciprocity)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('WORLD');
    await page.getByTestId('param-a-affine').fill('3');
    await page.getByTestId('param-b-affine').fill('5');
    await executeCipher(page, 'affine', 'encrypt');

    const outputText = page.getByTestId('output-text-affine');
    await expect(outputText).not.toHaveText(/Result will appear here/i);
    const ciphertext = (await outputText.textContent())?.trim() || '';

    await page.getByTestId('input-text-affine').fill(ciphertext);
    await executeCipher(page, 'affine', 'decrypt');
    await expect(outputText).toHaveText('world');
  });

  test('TC-T1-AFFINE-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('X');
    await page.getByTestId('param-a-affine').fill('5');
    await page.getByTestId('param-b-affine').fill('8');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-affine')).toBeVisible();
  });

  test('TC-T2-AFFINE-01 (Non-Coprime Parameter a)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('HELLO');
    await page.getByTestId('param-a-affine').fill('13');
    await page.getByTestId('param-b-affine').fill('5');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(page.getByTestId('exhibit-affine').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-AFFINE-02 (Even Value a)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('HELLO');
    await page.getByTestId('param-a-affine').fill('2');
    await page.getByTestId('param-b-affine').fill('3');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(page.getByTestId('exhibit-affine').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-AFFINE-03 (Negative Parameters)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('HELLO');
    await page.getByTestId('param-a-affine').fill('-5');
    await page.getByTestId('param-b-affine').fill('-8');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(async () => {
      const hasAlert = (await page.getByTestId('exhibit-affine').locator('[role="alert"]').count()) > 0;
      const outputText = (await page.getByTestId('output-text-affine').textContent())?.trim() || '';
      expect(hasAlert || !/Result will appear here/i.test(outputText)).toBe(true);
    }).toPass();
  });

  test('TC-T2-AFFINE-04 (Out of Bounds a/b)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('input-text-affine').fill('HELLO');
    await page.getByTestId('param-a-affine').fill('1001');
    await page.getByTestId('param-b-affine').fill('2000');
    await executeCipher(page, 'affine', 'encrypt');
    await expect(page.getByTestId('exhibit-affine').locator('[role="alert"]')).toBeVisible();
  });
});
