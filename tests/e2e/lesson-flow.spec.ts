import { expect, test } from '@playwright/test';

const authStorageState = process.env.E2E_AUTH_STORAGE_STATE;

test.describe('lesson flow guest smoke', () => {
    test('guest is redirected from private lesson routes to auth', async ({ page }) => {
        await page.goto('/lessons');

        await expect(page).toHaveURL(/\/auth$/);
        await expect(page.getByRole('heading', { name: /вход в аккаунт/i })).toBeVisible();
    });

    test('landing routes the user into a real flow, not a dead end', async ({ page }) => {
        await page.goto('/');

        const footer = page.getByRole('contentinfo');

        await expect(footer.getByRole('link', { name: 'Pricing' })).toBeVisible();
        await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible();
        await expect(footer.getByRole('link', { name: 'Terms' })).toBeVisible();
        await expect(footer.getByRole('link', { name: 'Support' })).toBeVisible();
    });
});

test.describe('lesson flow authenticated smoke', () => {
    test.skip(!authStorageState, 'Set E2E_AUTH_STORAGE_STATE to run authenticated lesson-flow smoke tests.');

    if (authStorageState) {
        test.use({ storageState: authStorageState });
    }

    test('seeded account can open home, lessons and profile surfaces', async ({ page }) => {
        await page.goto('/home');
        await expect(page).toHaveURL(/\/home$/);
        await expect(page.getByRole('heading', { name: /треки для обучения/i })).toBeVisible();

        await page.goto('/lessons');
        await expect(page).toHaveURL(/\/lessons$/);
        await expect(page.getByText('Python')).toBeVisible();

        await page.goto('/profile');
        await expect(page).toHaveURL(/\/profile$/);
        await expect(page.getByText(/сервисные страницы/i)).toBeVisible();
    });
});
