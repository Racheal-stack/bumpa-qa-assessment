import { test, expect, Page, Locator } from '@playwright/test';

async function checkEnvironment(page: Page) {
  const cloudflare = page.getByRole('heading', {
    name: /performing security verification/i,
  });

  if (await cloudflare.isVisible().catch(() => false)) {
    throw new Error(
      'Jumia blocked this Playwright attempt with Cloudflare security verification.'
    );
  }

  const bodyText = await page.locator('body').innerText().catch(() => '');

  if (/^\s*ERROR\s*$/i.test(bodyText)) {
    throw new Error(
      'Jumia returned an ERROR page instead of the application.'
    );
  }
}



async function handleConsent(page: Page) {
  const consentPopup = page.locator(
    '[data-pop-id="consentPopup"]'
  );

  const appeared = await consentPopup
    .waitFor({
      state: 'visible',
      timeout: 5_000,
    })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    return;
  }

  const consentButton = consentPopup
    .locator('button')
    .filter({
      hasText: /accept|agree|allow|continue/i,
    })
    .first();

  if (await consentButton.isVisible().catch(() => false)) {
    await consentButton.click();

    await consentPopup
      .waitFor({
        state: 'hidden',
        timeout: 5_000,
      })
      .catch(() => {});
  }
}


async function openJumia(page: Page): Promise<Locator> {
  await page.goto('https://www.jumia.com.ng/', {
    waitUntil: 'domcontentloaded',
    timeout: 30_000,
  });

  await page.waitForTimeout(3_000);

  await checkEnvironment(page);
  await handleConsent(page);
  await checkEnvironment(page);

  const searchInput = page
    .locator('input[placeholder*="Search products"]')
    .first();

  try {
    await expect(searchInput).toBeVisible({
      timeout: 15_000,
    });
  } catch {
    await checkEnvironment(page);

    throw new Error(
      `Jumia homepage loaded but the search field was unavailable. URL: ${page.url()}`
    );
  }

  return searchInput;
}

async function searchFor(
  page: Page,
  searchInput: Locator,
  query: string
) {
  await searchInput.fill(query);
  await searchInput.press('Enter');

  await expect(page).toHaveURL(
    /catalog|nivea|oraimo|\?q=/i,
    {
      timeout: 15_000,
    }
  );

  await checkEnvironment(page);
}

test.describe('Jumia Product Search and Filtering', () => {

  test(
    'should search for Nivea Body Lotion and filter by NIVEA brand',
    async ({ page }) => {
      test.setTimeout(60_000);

      const searchInput = await openJumia(page);

      await searchFor(
        page,
        searchInput,
        'Nivea Body Lotion'
      );

      const productResults = page.locator('article');

      await expect(productResults.first()).toBeVisible({
        timeout: 15_000,
      });

      const niveaFilter = page
        .getByText('NIVEA', {
          exact: true,
        })
        .filter({
          visible: true,
        })
        .first();

      await expect(niveaFilter).toBeVisible({
        timeout: 15_000,
      });

      await niveaFilter.click();

      await checkEnvironment(page);

      await expect(page).toHaveURL(/nivea/i, {
        timeout: 15_000,
      });
    }
  );


  test(
  'should add a Nivea Body Lotion product to cart',
  async ({ page }) => {
    test.setTimeout(90_000);

    const searchInput = await openJumia(page);

    await searchFor(
      page,
      searchInput,
      'Nivea Body Lotion'
    );

    await checkEnvironment(page);

    const productLink = page
      .locator('main article a[href$=".html"]')
      .filter({
        hasText: /Nivea.*Body Lotion/i,
      })
      .first();

    await expect(productLink).toBeVisible({
      timeout: 15_000,
    });

    const productName = (
      await productLink.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Selected product:', productName);

    await productLink.click();

    await page.waitForLoadState('domcontentloaded');

    await checkEnvironment(page);

   
    await expect(page).toHaveURL(/\.html(?:\?|$)/, {
      timeout: 15_000,
    });

    console.log('Product page:', page.url());

    const closeBanner = page.getByRole('button', {
      name: /close banner/i,
    });

    if (
      await closeBanner
        .isVisible({ timeout: 2_000 })
        .catch(() => false)
    ) {
      await closeBanner.click();
    }

    const addToCartButton = page
      .getByRole('button', {
        name: /add to cart/i,
      })
      .first();

    await expect(addToCartButton).toBeVisible({
      timeout: 15_000,
    });

await addToCartButton.click();

// Wait until Jumia confirms that the cart was actually updated.
const cartLink = page
  .getByRole('link', {
    name: /cart/i,
  })
  .first();

await expect(cartLink).toBeVisible({
  timeout: 10_000,
});

const addConfirmation = page
  .getByText(
    /added to cart|product added|successfully added/i
  )
  .first();

await addConfirmation
  .waitFor({
    state: 'visible',
    timeout: 5_000,
  })
  .catch(() => {});

await checkEnvironment(page);


await cartLink.click();

await expect(page).toHaveURL(/\/cart\/?/i, {
  timeout: 15_000,
});

await checkEnvironment(page);

const cartMain = page.locator('main');

await expect(cartMain).toBeVisible({
  timeout: 10_000,
});

await expect(
  cartMain,
  'The NIVEA product should be present in the cart after Add to Cart'
).toContainText(/NIVEA/i, {
  timeout: 15_000,
});

  }
);
test(
  'should search, filter and add an Oraimo Powerbank to cart',
  async ({ page }) => {
    test.setTimeout(90_000);

    // -------------------------------------------------------
    // TC-014 / TC-015 - Search for Oraimo Powerbank
    // -------------------------------------------------------

    const searchInput = await openJumia(page);

    await searchFor(
      page,
      searchInput,
      'Oraimo Powerbank'
    );

    await checkEnvironment(page);

    // Verify search results are displayed
    const productResults = page.locator('main article');

    await expect(productResults.first()).toBeVisible({
      timeout: 15_000,
    });

    // -------------------------------------------------------
    // TC-016 - Apply Oraimo brand filter
    // -------------------------------------------------------

    const oraimoFilter = page
      .getByText('Oraimo', {
        exact: true,
      })
      .filter({
        visible: true,
      })
      .first();

    await expect(oraimoFilter).toBeVisible({
      timeout: 15_000,
    });

    await oraimoFilter.click();

    await checkEnvironment(page);

    // Verify Oraimo-filtered results are displayed
    await expect(
      page.locator('main article').first()
    ).toBeVisible({
      timeout: 15_000,
    });

    // -------------------------------------------------------
    // TC-017 - Open an actual Oraimo Powerbank
    // -------------------------------------------------------

    const oraimoProductLink = page
      .locator('main article a[href$=".html"]')
      .filter({
        hasText: /Oraimo.*Power/i,
      })
      .first();

    await expect(oraimoProductLink).toBeVisible({
      timeout: 15_000,
    });

    const productName = (
      await oraimoProductLink.innerText()
    )
      .replace(/\s+/g, ' ')
      .trim();

    console.log(
      'Selected Oraimo product:',
      productName
    );

    await oraimoProductLink.click();

    await page.waitForLoadState(
      'domcontentloaded'
    );

    await checkEnvironment(page);

    // Verify we reached an actual product page
    await expect(page).toHaveURL(
      /\.html(?:\?|$)/,
      {
        timeout: 15_000,
      }
    );

    console.log(
      'Oraimo product page:',
      page.url()
    );

    // -------------------------------------------------------
    // Handle optional banner
    // -------------------------------------------------------

    const closeBanner = page.getByRole(
      'button',
      {
        name: /close banner/i,
      }
    );

    if (
      await closeBanner
        .isVisible({
          timeout: 2_000,
        })
        .catch(() => false)
    ) {
      await closeBanner.click();
    }

    // -------------------------------------------------------
    // Verify product page contains Oraimo
    // -------------------------------------------------------

    const productPage = page.locator('main');

    await expect(productPage).toContainText(
      /Oraimo/i,
      {
        timeout: 15_000,
      }
    );

    // -------------------------------------------------------
    // TC-018 - Add Oraimo Powerbank to cart
    // -------------------------------------------------------

    const addToCartButton = page
      .getByRole('button', {
        name: /add to cart/i,
      })
      .first();

    await expect(
      addToCartButton
    ).toBeVisible({
      timeout: 15_000,
    });

    // Add exactly once
    await addToCartButton.click();

    // Optional confirmation message
    const addConfirmation = page
      .getByText(
        /added to cart|product added|successfully added/i
      )
      .first();

    await addConfirmation
      .waitFor({
        state: 'visible',
        timeout: 5_000,
      })
      .catch(() => {});

    await checkEnvironment(page);

    // -------------------------------------------------------
    // Open cart
    // -------------------------------------------------------

    const cartLink = page
      .getByRole('link', {
        name: /cart/i,
      })
      .first();

    await expect(cartLink).toBeVisible({
      timeout: 10_000,
    });

    await cartLink.click();

    await expect(page).toHaveURL(
      /\/cart\/?/i,
      {
        timeout: 15_000,
      }
    );

    await checkEnvironment(page);

    // -------------------------------------------------------
    // Verify Oraimo product exists in cart
    // -------------------------------------------------------

    const cartMain = page.locator('main');

    await expect(cartMain).toBeVisible({
      timeout: 10_000,
    });

    await expect(cartMain).toContainText(
      /Oraimo/i,
      {
        timeout: 15_000,
      }
    );
  }
);
});