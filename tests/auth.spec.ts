/// <reference types="node" />

import { test, expect, Page } from '@playwright/test';

async function checkCloudflare(page: Page) {
  const verification = page.getByRole('heading', {
    name: /performing security verification/i,
  });

  if (await verification.isVisible().catch(() => false)) {
    test.skip(
      true,
      'Authentication blocked by Cloudflare security verification on Jumia production.'
    );
  }
}

test('authenticate with Jumia', async ({ page }) => {
  // 1. Open Jumia
  await page.goto('https://www.jumia.com.ng/', {
    waitUntil: 'domcontentloaded',
  });

  await checkCloudflare(page);

  const accountButton = page
    .getByText('Account', { exact: true })
    .first();

  await expect(accountButton).toBeVisible({
    timeout: 15_000,
  });

  await accountButton.click();

  const signIn = page
    .getByText(/sign in/i)
    .first();

  await expect(signIn).toBeVisible({
    timeout: 10_000,
  });

  await signIn.click();

  const emailInput = page.getByRole('textbox', {
    name: /email or mobile number/i,
  });

  await expect(emailInput).toBeVisible({
    timeout: 15_000,
  });

  const email = process.env.JUMIA_EMAIL;

  if (!email) {
    throw new Error(
      'JUMIA_EMAIL environment variable is missing'
    );
  }

  await emailInput.fill(email);

  await expect(emailInput).toHaveValue(email);

  const continueButton = page.getByRole('button', {
    name: /continue/i,
  });

  await expect(continueButton).toBeVisible({
    timeout: 10_000,
  });

  await expect(continueButton).toBeEnabled({
    timeout: 10_000,
  });

  await continueButton.click();

  await page
    .waitForLoadState('domcontentloaded')
    .catch(() => {});

  console.log('After Continue URL:', page.url());
  await page.pause();
});