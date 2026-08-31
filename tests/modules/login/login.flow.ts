import type { Page } from '@playwright/test';
import { getLoginEnvironment } from '../../support/environment';
import { LoginPage } from './login.page';

export async function login(page: Page) {
  const { loginUrl, username, password } = getLoginEnvironment();
  const loginPage = new LoginPage(page);

  await loginPage.open(loginUrl);
  await loginPage.enterCredentials(username, password);
  await loginPage.submit();

  return loginPage;
}
