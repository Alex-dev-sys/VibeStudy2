import { expect, test } from '@playwright/test';

test.describe('demo mode', () => {
    test('opens a populated workspace without registration', async ({ page }) => {
        const protectedRequests: string[] = [];
        page.on('request', (request) => {
            if (/\/rest\/v1\/|\/functions\/v1\//.test(request.url())) {
                protectedRequests.push(request.url());
            }
        });

        await page.goto('/auth');
        await page.getByRole('button', { name: /войти без регистрации/i }).click();

        await expect(page).toHaveURL(/\/home$/);
        await expect(page.getByText('Демо-режим', { exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: /центр обучения/i })).toBeVisible();
        await expect(page.getByText('Алекс Демо', { exact: true })).toBeVisible();

        await page.getByRole('link', { name: /уроки траектория обучения/i }).click();
        await expect(page).toHaveURL(/\/lessons$/);
        expect(protectedRequests).toEqual([]);
    });

    test('stays usable on a phone-sized viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/demo');

        await expect(page).toHaveURL(/\/home$/);
        await expect(page.getByRole('navigation', { name: /мобильная навигация/i })).toBeVisible();
        await expect(page.getByText('Демо-режим', { exact: true })).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasHorizontalOverflow).toBe(false);
    });
});
