# Bumpa QA Assessment

This repository contains the automated testing component of my QA assessment for Bumpa, using Jumia Nigeria as the application under test.

The assessment covers the onboarding and first-time checkout journey, including product search, filtering, product details, adding products to the cart, and checkout initiation without completing payment.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Chromium
- GitHub Actions

## Automated Test Coverage

The Playwright suite currently covers:

### Nivea Body Lotion

- Search for "Nivea Body Lotion"
- Validate search results
- Apply the NIVEA brand filter
- Open a selected Nivea product
- Add the product to the cart
- Verify the product is present in the cart

### Oraimo Powerbank

- Search for "Oraimo Powerbank"
- Validate search results
- Apply the Oraimo brand filter
- Open a selected Oraimo product
- Add the product to the cart
- Verify the product is present in the cart

## Manual Test Coverage

The following areas were primarily validated manually:

- New user registration
- Email OTP verification
- Password validation
- Phone number verification
- Authentication
- Multi-item cart validation across different sellers
- Checkout initiation
- Delivery and pickup-station selection
- Checkout total validation

Payment was intentionally excluded from the assessment, and no order was completed.

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

Install the Playwright Chromium browser:

```bash
npx playwright install chromium
```

## Running the Automated Tests

Run the Chromium test suite:

```bash
npx playwright test tests/example.spec.ts --project=chromium --workers=1
```

To run the tests in headed mode:

```bash
npx playwright test tests/example.spec.ts --project=chromium --headed --workers=1
```

To view the Playwright HTML report:

```bash
npx playwright show-report
```

## CI Integration

GitHub Actions is configured to run the Playwright test suite automatically when code is pushed to the `main` branch or when a pull request targeting `main` is created.

The CI workflow:

**Push / Pull Request → GitHub Actions → Install Dependencies → Install Playwright Chromium → Run Automated Tests → Upload Playwright Report**

The workflow configuration is located at:

```text
.github/workflows/playwright.yml
```

## Environment Limitation

The tests are executed against the live Jumia Nigeria production website.

During repeated automated executions, Jumia's Cloudflare security verification intermittently blocked Playwright from accessing the application.

The same restriction was encountered during GitHub Actions execution, where the GitHub-hosted automated browser was blocked before the functional test steps could execute.

This is treated as an external environment limitation rather than a confirmed functional defect in the tested Jumia functionality.

In a production QA environment, a controlled staging/test environment would be preferable for stable automated regression testing.

## Test Reports

Playwright generates an HTML report after test execution.

In GitHub Actions, the Playwright report is uploaded as a workflow artifact to support investigation of failed CI executions.

## Security

Authentication credentials are not stored in the source code.

Where authentication experiments require credentials, environment variables are used instead of hard-coded values. Authentication automation was not included as a reliable regression scenario because Jumia's security verification prevented the automated browser from consistently reaching the password authentication step.

## Author

**Racheal Joseph**

Bumpa QA Assessment — September 2026