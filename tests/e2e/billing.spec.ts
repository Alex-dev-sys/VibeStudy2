import { expect, test } from '@playwright/test';

const authStorageState = process.env.E2E_AUTH_STORAGE_STATE;

test.describe('billing guest smoke', () => {
    test('pricing page shows direct wallet payment flow and routes guest to auth before tx hash submission', async ({ page }) => {
        await page.goto('/pricing');

        await expect(page.getByRole('heading', { name: /pricing without traps/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Monthly', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: '3 months' })).toBeVisible();
        await expect(page.getByText('TWZVDV68FQxw1EPriHTzEAsw7U6kHjBzMh', { exact: true })).toBeVisible();
        await expect(page.getByText(/USDT \(TRC20\)/i)).toBeVisible();

        await page.getByRole('button', { name: /submit tx hash/i }).first().click();
        await expect(page).toHaveURL(/\/auth$/);
        await expect(page.getByRole('heading', { name: /login|вход/i })).toBeVisible();
    });
});

test.describe('billing authenticated smoke', () => {
    test.skip(!authStorageState, 'Set E2E_AUTH_STORAGE_STATE to run authenticated billing smoke tests.');

    if (authStorageState) {
        test.use({ storageState: authStorageState });
    }

    test('seeded account can inspect pricing and current payment request state', async ({ page }) => {
        await page.goto('/pricing');
        await expect(page.getByRole('heading', { name: /pricing without traps/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /submit tx hash/i }).first()).toBeVisible();

        await page.goto('/profile');
        await expect(page.getByText(/plan|план/i)).toBeVisible();
        await expect(page.getByText(/payment|оплат/i)).toBeVisible();
    });
});
