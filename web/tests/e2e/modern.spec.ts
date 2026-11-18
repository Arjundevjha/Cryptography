import { test, expect } from '@playwright/test';
import { openExhibit, executeCipher } from './helpers';

test.describe('Modern Ciphers E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // AES CIPHER
  // ==========================================

  test('TC-T1-AES-01 (Encrypt AES-128 CTR)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Secret Message');
    await page.getByTestId('param-key-aes').fill('1234567890123456');
    await executeCipher(page, 'aes', 'encrypt');
    await expect(page.getByTestId('output-text-aes')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T1-AES-02 (Decrypt AES-128 CTR)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Secret Message');
    await page.getByTestId('param-key-aes').fill('1234567890123456');
    await executeCipher(page, 'aes', 'encrypt');

    const output = page.getByTestId('output-text-aes');
    await expect(output).not.toHaveText(/Result will appear here/i);
    const ciphertext = (await output.textContent())?.trim() || '';

    await page.getByTestId('input-text-aes').fill(ciphertext);
    await executeCipher(page, 'aes', 'decrypt');
    await expect(output).toHaveText('Secret Message');
  });

  test('TC-T1-AES-03 (AES-256 Encrypt)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Secret Message');
    await page.getByTestId('param-key-aes').fill('12345678901234561234567890123456');
    await executeCipher(page, 'aes', 'encrypt');
    await expect(page.getByTestId('aes-padding-iv-visualizer')).toBeVisible();
    await expect(page.getByTestId('output-text-aes')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T1-AES-04 (AES-CBC Mode & IV-Reuse Lab)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('aes-mode-cbc').click();
    await page.getByTestId('aes-reuse-iv-btn').click();
    await page.getByTestId('aes-load-identical-blocks-btn').click();
    await executeCipher(page, 'aes', 'encrypt');

    const blocksOutput = page.getByTestId('aes-cbc-blocks-output');
    await expect(blocksOutput).toBeVisible();
    await expect(blocksOutput).toContainText('CBC Ciphertext Blocks');
  });

  test('TC-T1-AES-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Secret Message');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-aes')).toBeVisible();
  });

  test('TC-T2-AES-01 (Invalid Key Size)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('Secret Message');
    await page.getByTestId('param-key-aes').fill('12345');
    await executeCipher(page, 'aes', 'encrypt');
    await expect(page.getByTestId('exhibit-aes').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-AES-03 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('');
    await page.getByTestId('param-key-aes').fill('1234567890123456');
    await expect(page.getByTestId('exhibit-aes').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-aes')).toHaveText(/Result will appear here/i);
  });

  test('TC-T2-AES-05 (Invalid Ciphertext Decryption)', async ({ page }) => {
    await openExhibit(page, /AES Vault/i, 'aes');
    await page.getByTestId('input-text-aes').fill('InvalidHexFormat!');
    await page.getByTestId('param-key-aes').fill('1234567890123456');
    await executeCipher(page, 'aes', 'decrypt');
    await expect(page.getByTestId('exhibit-aes').locator('[role="alert"]')).toBeVisible();
  });

  // ==========================================
  // RSA CIPHER
  // ==========================================

  test('TC-T1-RSA-01 (Keypair Gen)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toHaveCount(0);
  });

  test('TC-T1-RSA-02 (Encrypt Message)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('generate-keys-btn-rsa').click();

    await page.getByTestId('input-text-rsa').fill('42');
    await executeCipher(page, 'rsa', 'encrypt');
    await expect(page.getByTestId('output-text-rsa')).not.toHaveText(/Result will appear here/i);
  });

  test('TC-T1-RSA-03 (Decrypt Ciphertext)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('generate-keys-btn-rsa').click();

    await page.getByTestId('input-text-rsa').fill('42');
    await executeCipher(page, 'rsa', 'encrypt');
    const outputRsa = page.getByTestId('output-text-rsa');
    await expect(outputRsa).not.toHaveText(/Result will appear here/i);
    const ciphertext = (await outputRsa.textContent())?.trim() || '';

    await page.getByTestId('input-text-rsa').fill(ciphertext);
    await executeCipher(page, 'rsa', 'decrypt');
    await expect(outputRsa).toHaveText('42');
  });

  test('TC-T1-RSA-04 (Custom e Selection)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('param-e-rsa').fill('17');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toHaveCount(0);
  });

  test('TC-T1-RSA-05 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-rsa')).toBeVisible();
  });

  test('TC-T2-RSA-01 (Non-Prime Parameters)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('4');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-RSA-02 (Primes Too Small)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('2');
    await page.getByTestId('param-q-rsa').fill('3');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-RSA-03 (Coprimality Violation for e)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('param-p-rsa').fill('61');
    await page.getByTestId('param-q-rsa').fill('53');
    await page.getByTestId('param-e-rsa').fill('13');
    await page.getByTestId('generate-keys-btn-rsa').click();
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toBeVisible();
  });

  test('TC-T2-RSA-04 (Empty Input Validation)', async ({ page }) => {
    await openExhibit(page, /RSA Vault/i, 'rsa');
    await page.getByTestId('input-text-rsa').fill('');
    await expect(page.getByTestId('exhibit-rsa').locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByTestId('output-text-rsa')).toHaveText(/Result will appear here/i);
  });

  // ==========================================
  // SHA-256 CIPHER
  // ==========================================

  test('TC-T1-SHA256-01 (Hash Empty String)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(page.getByTestId('output-text-sha256')).toHaveText(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  test('TC-T1-SHA256-02 (Hash Text)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('hello');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(page.getByTestId('output-text-sha256')).toHaveText(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });

  test('TC-T1-SHA256-03 (Varying Case Hash)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('Hello');
    await executeCipher(page, 'sha256', 'encrypt');
    const outputLocator = page.getByTestId('output-text-sha256');
    await expect(outputLocator).not.toHaveText(/Result will appear here/i);
    const hash1 = (await outputLocator.textContent())?.trim() || '';

    await page.getByTestId('input-text-sha256').fill('hello');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(outputLocator).not.toHaveText(hash1);
  });

  test('TC-T1-SHA256-04 (Step Inspector Tab)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('A');
    await page.getByRole('tab', { name: /Steps/i }).click();
    await expect(page.getByTestId('step-inspector-sha256')).toBeVisible();
  });

  test('TC-T2-SHA256-02 (Unicode/Emoji Inputs)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('Hello World 🌍🔒');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(page.getByTestId('output-text-sha256')).toHaveText(/^[a-f0-9]{64}$/);
  });

  test('TC-T2-SHA256-04 (Special Symbol Inputs)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('Hello\n\tWorld\\escape');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(page.getByTestId('output-text-sha256')).toHaveText(/^[a-f0-9]{64}$/);
  });

  test('TC-T2-SHA256-05 (Rapid Sequence Changes)', async ({ page }) => {
    await openExhibit(page, /SHA-256 Vault/i, 'sha256');
    await page.getByTestId('input-text-sha256').fill('a');
    await page.getByTestId('input-text-sha256').pressSequentially('bcdef');
    await executeCipher(page, 'sha256', 'encrypt');
    await expect(page.getByTestId('output-text-sha256')).toHaveText(/^[a-f0-9]{64}$/);
  });
});
