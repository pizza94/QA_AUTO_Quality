import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { login } from './login.flow';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
  expected: {
    landingHeading: string;
    urlMustNotContain: string;
  };
};

test('TC-LOGIN-001 유효한 계정으로 로그인한다', async ({ page }) => {
  const data = await loadTestData<LoginTestData>('login.yml');
  test.skip(!hasLoginEnvironment(data.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const loginPage = await login(page, data.credentials);

  await expect(loginPage.loginButton).toBeHidden();
  await expect(page.getByRole('heading', { name: data.expected.landingHeading })).toBeVisible();
  expect(page.url()).not.toContain(data.expected.urlMustNotContain);
});
