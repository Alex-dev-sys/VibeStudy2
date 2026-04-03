import { expect, test } from '@playwright/test';

const authStorageState = process.env.E2E_AUTH_STORAGE_STATE;

test.describe('billing guest smoke', () => {
    test('pricing page shows hosted-first Binance Pay checkout and routes guest to auth before checkout', async ({ page }) => {
        await page.goto('/pricing');

        await expect(page.getByRole('heading', { name: /binance pay/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /30 days/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /90 days/i })).toBeVisible();
        await expect(page.getByText(/one-time payment/i).first()).toBeVisible();
        await expect(page.getByText(/no auto-renew/i).first()).toBeVisible();
        await expect(page.getByText(/secure transaction via binance/i).first()).toBeVisible();

        await page.getByRole('button', { name: /continue to secure binance pay/i }).first().click();
        await expect(page).toHaveURL(/\/auth$/);
        await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });
});

test.describe('billing authenticated smoke', () => {
    test.skip(!authStorageState, 'Set E2E_AUTH_STORAGE_STATE to run authenticated billing smoke tests.');

    if (authStorageState) {
        test.use({ storageState: authStorageState });
    }

    test('seeded account can inspect Binance checkout surface and payment summary', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page.getByRole('heading', { name: /binance pay/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /continue to secure binance pay/i }).first()).toBeVisible();
        await expect(page.getByText(/instant access after confirmation/i)).toBeVisible();

        await page.goto('/profile');
        await expect(page.getByText(/plan|план/i)).toBeVisible();
        await expect(page.getByText(/payment|оплат/i)).toBeVisible();
    });
});
