import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { login } from './login.flow';

type LoginTestCase = {
  id: string;
  credentials: LoginEnvironmentReferences;
  expected: {
    landingHeading: string;
    urlMustNotContain: string;
  };
};

test('TC-LOGIN-001 유효한 계정으로 로그인한다', async ({ page }) => {
  const tc = await loadTestData<LoginTestCase>('login', 'tc-login-001.yml');
  test.skip(!hasLoginEnvironment(tc.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const loginPage = await login(page, tc.credentials);

  await expect(loginPage.loginButton).toBeHidden();
  await expect(page.getByRole('heading', { name: tc.expected.landingHeading })).toBeVisible();
  expect(page.url()).not.toContain(tc.expected.urlMustNotContain);
});
