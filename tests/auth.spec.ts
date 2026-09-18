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

  // 2. Open Account menu
  const accountButton = page
    .getByText('Account', { exact: true })
    .first();

  await expect(accountButton).toBeVisible({
    timeout: 15_000,
  });

  await accountButton.click();

  // 3. Click Sign In
  const signIn = page
    .getByText(/sign in/i)
    .first();

  await expect(signIn).toBeVisible({
    timeout: 10_000,
  });

  await signIn.click();

  // 4. Find email field
  const emailInput = page.getByRole('textbox', {
    name: /email or mobile number/i,
  });

  await expect(emailInput).toBeVisible({
    timeout: 15_000,
  });

  // 5. Get email from environment variable
  const email = process.env.JUMIA_EMAIL;

  if (!email) {
    throw new Error(
      'JUMIA_EMAIL environment variable is missing'
    );
  }

  // 6. Enter email
  await emailInput.fill(email);

  await expect(emailInput).toHaveValue(email);

  // 7. Find Continue button
  const continueButton = page.getByRole('button', {
    name: /continue/i,
  });

  await expect(continueButton).toBeVisible({
    timeout: 10_000,
  });

  await expect(continueButton).toBeEnabled({
    timeout: 10_000,
  });

  // 8. Click Continue
  await continueButton.click();

  // 9. Wait for Jumia's next login screen
  await page
    .waitForLoadState('domcontentloaded')
    .catch(() => {});

  console.log('After Continue URL:', page.url());

  // 10. STOP HERE
  // We want to see what Jumia shows next.
  await page.pause();
});