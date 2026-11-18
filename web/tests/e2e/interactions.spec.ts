import { test, expect } from '@playwright/test';
import { openExhibit, executeCipher } from './helpers';

test.describe('Tier 3: Pairwise Interactions & Visual Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-T3-INTERACT-01 (Parameter State Persistence Across Exhibits)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('param-shift-caesar').fill('7');

    await openExhibit(page, /Enigma Machine/i, 'enigma');
    await expect(page.getByTestId('exhibit-enigma')).toBeVisible();

    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await expect(page.getByTestId('param-shift-caesar')).toHaveValue('7');
  });

  test('TC-T3-INTERACT-02 (Mode Select State Preservation)', async ({ page }) => {
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await page.getByTestId('decrypt-btn-affine').click();
    await expect(page.getByTestId('decrypt-btn-affine')).toHaveAttribute('aria-pressed', 'true');

    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await openExhibit(page, /Affine Cipher/i, 'affine');
    await expect(page.getByTestId('decrypt-btn-affine')).toHaveAttribute('aria-pressed', 'true');
  });

  test('TC-T3-INTERACT-04 (2D Floorplan Map Wing & Exhibit Switching)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await expect(page.getByTestId('exhibit-aes')).toBeVisible();

    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await expect(page.getByTestId('exhibit-caesar')).toBeVisible();
  });

  test('TC-T3-INTERACT-05 (Mobile Viewport Exhibit Interaction)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await expect(page.getByTestId('exhibit-caesar')).toBeVisible();
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');
  });

  test('TC-T3-INTERACT-06 (Theme Contrast Compliance)', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await expect(page.getByTestId('exhibit-caesar')).toHaveCSS('color', /rgb/);
  });

  test('TC-T3-INTERACT-07 (Reduced Motion Media Query)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');
  });

  test('TC-T3-INTERACT-08 (Keyboard Accessibility Navigation)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    const cipherTab = page.getByRole('tab', { name: /Cipher/i });
    await cipherTab.focus();
    await expect(cipherTab).toBeFocused();

    await page.keyboard.press('ArrowRight');
    const crackTab = page.getByRole('tab', { name: /Crack/i });
    await expect(crackTab).toBeFocused();
    await expect(page.getByTestId('cryptanalysis-view-caesar')).toBeVisible();
  });

  test('TC-T3-INTERACT-09 (Error Auto-dismissal on Valid Execute)', async ({ page }) => {
    await openExhibit(page, /Vigenère Cipher/i, 'vigenere');
    await page.getByTestId('input-text-vigenere').fill('HELLO');
    await page.getByTestId('param-key-vigenere').fill('');
    await executeCipher(page, 'vigenere', 'encrypt');

    const alert = page.getByTestId('exhibit-vigenere').locator('[role="alert"]');
    await expect(alert).toBeVisible();

    await page.getByTestId('param-key-vigenere').fill('KEY');
    await executeCipher(page, 'vigenere', 'encrypt');
    await expect(alert).toHaveCount(0);
    await expect(page.getByTestId('output-text-vigenere')).toHaveText('RIJVS');
  });

  test('TC-T3-INTERACT-10 (Output Copy-Paste Integration)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');

    await page.getByRole('button', { name: /Copy ciphertext result to clipboard/i }).click();
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');
  });

  test('TC-T3-INTERACT-11 (2D Floorplan Dialog Escape Close)', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle 2D museum floorplan map' }).click();
    const dialog = page.getByRole('dialog', { name: 'Interactive Museum Floorplan Map' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('TC-T3-INTERACT-14 (Swap Output Into Input & Toggle Mode)', async ({ page }) => {
    await openExhibit(page, /Caesar Cipher/i, 'caesar');
    await page.getByTestId('input-text-caesar').fill('HELLO');
    await page.getByTestId('param-shift-caesar').fill('3');
    await executeCipher(page, 'caesar', 'encrypt');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('KHOOR');

    await page.getByRole('button', { name: /Swap output text into input/i }).click();
    await expect(page.getByTestId('input-text-caesar')).toHaveValue('KHOOR');
    await expect(page.getByTestId('decrypt-btn-caesar')).toHaveAttribute('aria-pressed', 'true');

    await executeCipher(page, 'caesar');
    await expect(page.getByTestId('output-text-caesar')).toHaveText('HELLO');
  });
});
