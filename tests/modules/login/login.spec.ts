import { test, expect } from '../../fixtures';
import { hasLoginEnvironment } from '../../support/environment';
import { login } from './login.flow';

test('TC-LOGIN-001 유효한 계정으로 로그인한다', async ({ page }) => {
  test.skip(!hasLoginEnvironment(), '로그인 환경변수가 설정되지 않았습니다.');

  const loginPage = await login(page);

  await expect(loginPage.loginButton).toBeHidden();
  await expect(page).not.toHaveURL(/\/login(?:#\/?)?$/);
  await expect(page.getByRole('heading', { name: 'Welcome to Data Portal' })).toBeVisible();
});
