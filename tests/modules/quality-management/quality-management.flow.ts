import type { Page } from '@playwright/test';
import type { LoginEnvironmentReferences } from '../../support/environment';
import { login } from '../login/login.flow';
import { QualityManagementPage } from './quality-management.page';

export async function openQualityManagement(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences
) {
  await login(page, loginEnvironment);

  const qualityManagementPage = new QualityManagementPage(page);
  await qualityManagementPage.openFromPortal();

  return qualityManagementPage;
}
