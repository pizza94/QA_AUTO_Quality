import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { openQualityManagement } from './quality-management.flow';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
};

type QualityManagementTestData = {
  expected: {
    pageTitle: string;
    urlContains: string;
    primaryMenus: string[];
  };
};

test('TC-002 품질관리 카드로 QualityStream에 진입한다', async ({ page }) => {
  const loginData = await loadTestData<LoginTestData>('login.yml');
  const qualityData = await loadTestData<QualityManagementTestData>('quality-management.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const qualityManagementPage = await openQualityManagement(page, loginData.credentials);

  await expect(page).toHaveTitle(qualityData.expected.pageTitle);
  expect(page.url()).toContain(qualityData.expected.urlContains);
  await expect(qualityManagementPage.dashboardTab).toBeVisible();

  for (const menuName of qualityData.expected.primaryMenus) {
    await expect(qualityManagementPage.menuLink(menuName)).toBeVisible();
  }
});
