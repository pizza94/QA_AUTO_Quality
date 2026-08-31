import { test, expect } from './fixtures';

test('대상 서비스 기본 화면이 열린다', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
});

