import { expect, test } from '@playwright/test';

test.describe('public trust surfaces', () => {
    test('auth page legal links navigate to real trust pages', async ({ page }) => {
        await page.goto('/auth');

        await page.getByRole('link', { name: /условиями использования/i }).click();
        await expect(page).toHaveURL(/\/terms$/);
        await expect(page.getByRole('heading', { name: /terms of use/i })).toBeVisible();

        await page.goto('/auth');

        await page.getByRole('link', { name: /политикой конфиденциальности/i }).click();
        await expect(page).toHaveURL(/\/privacy$/);
        await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
    });
});
