import type { Page } from '@playwright/test';
import { getLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { LoginPage } from './login.page';

export async function login(page: Page, references: LoginEnvironmentReferences) {
  const { loginUrl, username, password } = getLoginEnvironment(references);
  const loginPage = new LoginPage(page);

  await loginPage.open(loginUrl);
  await loginPage.enterCredentials(username, password);
  await loginPage.submit();

  return loginPage;
}
