import { test, expect } from '../../fixtures';
import { openService } from './smoke.flow';

test('대상 서비스 기본 화면이 열린다', async ({ page }) => {
  const { response, smokePage } = await openService(page);

  expect(response?.ok()).toBeTruthy();
  await expect(smokePage.body).toBeVisible();
});
