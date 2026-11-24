import { test, expect, type Page } from '@playwright/test';

async function openExhibitViaMap(page: Page, exhibitNamePattern: RegExp) {
  await page.getByRole('button', { name: 'Toggle 2D museum floorplan map' }).click();
  const dialog = page.getByRole('dialog', { name: 'Interactive Museum Floorplan Map' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: exhibitNamePattern }).click();
  await expect(dialog).toBeHidden();
}

test.describe('3D Cryptography Museum E2E Suite', () => {
  test('WebGL canvas smoke check & HUD baseline', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(200);
    expect(box!.height).toBeGreaterThan(200);

    await expect(page.getByRole('heading', { name: 'CRYPTOGRAPHY MUSEUM' })).toBeVisible();
    await expect(page.getByTestId('passport-progress-badge')).toContainText('0/20');
    await expect(page.getByTestId('api-status-dot')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('New exhibit: Substitution cipher roundtrip via backend', async ({ page }) => {
    await page.goto('/');
    await openExhibitViaMap(page, /Substitution Cipher/i);

    await expect(page.getByTestId('exhibit-substitution')).toBeVisible();
    await page.getByTestId('input-text-substitution').fill('HELLO');
    await page.getByTestId('execute-btn-substitution').click();

    const output = page.getByTestId('output-text-substitution');
    await expect(output).not.toHaveText(/Result will appear here/i);
    await expect(output).toHaveText(/^[A-Z]{5}$/);
    const encrypted = (await output.textContent())?.trim() ?? '';
    expect(encrypted).not.toBe('HELLO');

    // Swap output into input and decrypt back to HELLO
    await page.getByRole('button', { name: /Swap output text into input/i }).click();
    await page.getByTestId('execute-btn-substitution').click();
    await expect(output).toHaveText('HELLO');
  });

  test('New exhibit: Multi-Hash Digest & HMAC Sign/Verify', async ({ page }) => {
    await page.goto('/');
    await openExhibitViaMap(page, /Multi-Hash & HMAC/i);

    await expect(page.getByTestId('exhibit-hmac-hash')).toBeVisible();
    await page.getByTestId('input-text-hmac-hash').fill('hello');
    await page.getByTestId('param-algo-hmac-hash').selectOption('md5');
    await page.getByTestId('execute-btn-hmac-hash').click();

    await expect(page.getByTestId('output-text-hmac-hash')).toContainText(
      '5d41402abc4b2a76b9719d911017c592'
    );

    // Switch to HMAC Sign
    await page.getByRole('button', { name: 'HMAC Sign' }).click();
    await page.getByTestId('param-key-hmac-hash').fill('museum-secret');
    await page.getByTestId('execute-btn-hmac-hash').click();

    const sigOutput = page.getByTestId('output-text-hmac-hash');
    await expect(sigOutput).toHaveText(/^[a-f0-9]{64}$/i);
    const signature = (await sigOutput.textContent())!.trim();

    // Switch to HMAC Verify
    await page.getByRole('button', { name: 'HMAC Verify' }).click();
    await page.getByTestId('param-sig-hmac-hash').fill(signature);
    await page.getByTestId('execute-btn-hmac-hash').click();
    await expect(sigOutput).toContainText('VALID');
  });

  test('New exhibit: Diffie-Hellman Key Exchange', async ({ page }) => {
    await page.goto('/');
    await openExhibitViaMap(page, /Diffie-Hellman Exchange/i);

    await expect(page.getByTestId('exhibit-diffie-hellman')).toBeVisible();
    await expect(page.getByTestId('dh-visualizer')).toBeVisible();

    await page.getByTestId('param-p-diffie-hellman').fill('23');
    await page.getByTestId('param-g-diffie-hellman').fill('5');
    await page.getByTestId('param-a-diffie-hellman').fill('6');
    await page.getByTestId('param-b-diffie-hellman').fill('15');
    await page.getByTestId('execute-btn-diffie-hellman').click();

    const output = page.getByTestId('output-text-diffie-hellman');
    await expect(output).toContainText('A=8, B=19, Shared Secret=2');
  });

  test('Guided Tour Mode: All Wings itinerary, Next/Prev, and Escape exit', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Toggle guided historical tour' }).click();
    const tourBar = page.getByRole('region', { name: 'Guided historical tour' });
    await expect(tourBar).toBeVisible();

    await tourBar.getByRole('button', { name: 'All Wings' }).click();
    await expect(tourBar).toContainText('Stop 1 of 23');

    await tourBar.getByRole('button', { name: 'Next tour stop' }).click();
    await expect(tourBar).toContainText('Stop 2 of 23');

    await tourBar.getByRole('button', { name: 'Previous tour stop' }).click();
    await expect(tourBar).toContainText('Stop 1 of 23');

    await page.keyboard.press('Escape');
    await expect(tourBar).toBeHidden();
  });

  test('Frequency Analysis & Step-by-Step Inspector tabs', async ({ page }) => {
    await page.goto('/');
    await openExhibitViaMap(page, /Caesar Cipher/i);

    // Cryptanalysis tab
    await page.getByRole('tab', { name: /Crack/i }).click();
    const cryptoView = page.getByTestId('cryptanalysis-view-caesar');
    await expect(cryptoView).toBeVisible();
    await cryptoView.getByRole('button', { name: 'Load Sample Ciphertext' }).click();
    await expect(cryptoView).toContainText('Index of Coincidence');

    // Navigate to Playfair and test Step Inspector
    await openExhibitViaMap(page, /Playfair Cipher/i);
    await page.getByRole('tab', { name: /Steps/i }).click();
    const stepView = page.getByTestId('step-inspector-playfair');
    await expect(stepView).toBeVisible();
    await stepView.getByRole('button', { name: 'Next Playfair step' }).click();
  });

  test('Passport Challenge unlocks stamp and persists in localStorage', async ({ page }) => {
    await page.goto('/');
    await openExhibitViaMap(page, /Caesar Cipher/i);

    await page.getByRole('tab', { name: /Stamp/i }).click();
    await expect(page.getByTestId('passport-challenge-caesar')).toBeVisible();

    await page.getByTestId('challenge-input-caesar').fill('VENI VIDI VICI');
    await page.getByTestId('challenge-submit-caesar').click();

    await expect(page.getByTestId('passport-progress-badge')).toContainText('1/20');

    await page.reload();
    await expect(page.getByTestId('passport-progress-badge')).toContainText('1/20');
  });

  test('Mobile viewport responsiveness & touch controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    await expect(page.getByTestId('passport-progress-badge')).toBeVisible();
    const mobileTourBtn = page.getByRole('button', { name: 'Start or stop guided tour' });
    await expect(mobileTourBtn).toBeVisible();
    await mobileTourBtn.click();

    const tourBar = page.getByRole('region', { name: 'Guided historical tour' });
    await expect(tourBar).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
