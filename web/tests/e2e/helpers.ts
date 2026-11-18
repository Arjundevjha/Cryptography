import { expect, type Page } from '@playwright/test';

export async function openExhibit(page: Page, exhibitNamePattern: RegExp, exhibitId: string) {
  await page.getByTestId('passport-progress-badge').waitFor({ state: 'visible' });
  const mapBtn = page.getByRole('button', { name: 'Toggle 2D museum floorplan map' });
  if (await mapBtn.isVisible()) {
    await mapBtn.click();
  } else {
    await page.keyboard.press('m');
  }
  const dialog = page.getByRole('dialog', { name: 'Interactive Museum Floorplan Map' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: exhibitNamePattern }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId(`exhibit-${exhibitId}`)).toBeVisible();
}

export async function executeCipher(page: Page, exhibitId: string, mode?: 'encrypt' | 'decrypt') {
  if (mode === 'encrypt') {
    await page.getByTestId(`encrypt-btn-${exhibitId}`).click();
  } else if (mode === 'decrypt') {
    await page.getByTestId(`decrypt-btn-${exhibitId}`).click();
  }
  await page.getByTestId(`execute-btn-${exhibitId}`).click();
}
