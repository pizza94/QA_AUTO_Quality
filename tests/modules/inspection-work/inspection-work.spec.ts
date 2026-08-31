import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { ProfilingSettingsPage, type ProfilingSettingsInput } from '../profiling-settings/profiling-settings.page';
import { registerProfilingInspectionWork } from './inspection-work.flow';
import type { InspectionWorkInput } from './inspection-work.page';

test('TC-009 프로파일링 점검작업을 등록하고 조회한다', async ({ page }) => {
  const loginData = await loadTestData<{ credentials: LoginEnvironmentReferences }>('login.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');
  const workData = await loadTestData<{ input: InspectionWorkInput }>('inspection-work.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  await openQualityManagement(page, loginData.credentials);
  const profilingPage = new ProfilingSettingsPage(page);
  await profilingPage.open();
  await profilingPage.search(profilingData.input);
  const target = await profilingPage.latestTarget(profilingData.input);
  const { workPage, jobName } = await registerProfilingInspectionWork(page, workData.input, target);
  await expect(workPage.jobRow(jobName)).toContainText(jobName);
});
