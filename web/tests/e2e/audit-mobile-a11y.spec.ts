import { test, expect, type Page } from '@playwright/test';

async function setupCleanRuntime(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  await page.route('**/_vercel/insights/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.route('**/api/health', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' })
  );

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  return { consoleErrors, pageErrors };
}

async function openMapAndSelect(page: Page, targetName: RegExp) {
  const mapBtn = page.getByRole('button', { name: 'Toggle 2D museum floorplan map' });
  if (await mapBtn.isVisible()) {
    await mapBtn.click();
  } else {
    await page.keyboard.press('m');
  }
  const dialog = page.getByRole('dialog', { name: 'Interactive Museum Floorplan Map' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: targetName }).click();
  await expect(dialog).toBeHidden();
}

test.describe('Mobile, Touch & Accessibility Audit', () => {
  test.describe('Mobile & Touch Viewport (390x844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test('Workbench fits mobile viewport with no horizontal overflow and zero runtime errors', async ({ page }) => {
      const { consoleErrors, pageErrors } = await setupCleanRuntime(page);

      await page.goto('/');
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });

      await openMapAndSelect(page, /Caesar Cipher/i);

      const workbench = page.getByTestId('exhibit-caesar');
      await expect(workbench).toBeVisible();

      const box = await workbench.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(391);

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });

    test('StatueCuratorialDrawer modal, ARIA tabs, and Escape dismissal on mobile', async ({ page }) => {
      const { consoleErrors, pageErrors } = await setupCleanRuntime(page);

      await page.goto('/');
      await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });

      await openMapAndSelect(page, /Navigate to statue monument Al-Kindi/i);

      const drawer = page.getByRole('dialog', { name: /Statue details for/i });
      await expect(drawer).toBeVisible();
      await expect(drawer).toHaveAttribute('aria-modal', 'true');

      const drawerBox = await drawer.boundingBox();
      expect(drawerBox).not.toBeNull();
      expect(drawerBox!.width).toBeLessThanOrEqual(390);

      const tablist = drawer.getByRole('tablist', { name: 'Statue details view mode' });
      await expect(tablist).toBeVisible();

      const curationTab = tablist.getByRole('tab', { name: /Historical Curation/i });
      const labTab = tablist.getByRole('tab', { name: /Interactive Pioneer Lab/i });

      await expect(curationTab).toHaveAttribute('aria-selected', 'true');
      await expect(labTab).toHaveAttribute('aria-selected', 'false');

      await labTab.focus();
      await page.keyboard.press('Enter');
      await expect(labTab).toHaveAttribute('aria-selected', 'true');
      await expect(curationTab).toHaveAttribute('aria-selected', 'false');

      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();

      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  });

  test('Desktop keyboard & ARIA tab accessibility across map dialog and workbench', async ({ page }) => {
    const { consoleErrors, pageErrors } = await setupCleanRuntime(page);

    await page.goto('/');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 });

    // Map dialog opens and closes via Escape
    const mapBtn = page.getByRole('button', { name: 'Toggle 2D museum floorplan map' });
    await mapBtn.click();
    const mapDialog = page.getByRole('dialog', { name: 'Interactive Museum Floorplan Map' });
    await expect(mapDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(mapDialog).toBeHidden();

    // Navigate to Caesar Cipher and verify workbench tablist ARIA & keyboard activation
    await openMapAndSelect(page, /Caesar Cipher/i);
    const workbench = page.getByTestId('exhibit-caesar');
    const tablist = workbench.getByRole('tablist', { name: 'Workbench tools' });
    await expect(tablist).toBeVisible();

    const cipherTab = tablist.getByRole('tab', { name: /Cipher/i });
    const crackTab = tablist.getByRole('tab', { name: /Crack/i });
    const stepsTab = tablist.getByRole('tab', { name: /Steps/i });
    const stampTab = tablist.getByRole('tab', { name: /Stamp/i });

    await expect(cipherTab).toHaveAttribute('aria-selected', 'true');

    await crackTab.focus();
    await page.keyboard.press('Enter');
    await expect(crackTab).toHaveAttribute('aria-selected', 'true');
    await expect(cipherTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByTestId('cryptanalysis-view-caesar')).toBeVisible();

    await stepsTab.focus();
    await page.keyboard.press('Enter');
    await expect(stepsTab).toHaveAttribute('aria-selected', 'true');

    await stampTab.focus();
    await page.keyboard.press('Enter');
    await expect(stampTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('passport-challenge-caesar')).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
