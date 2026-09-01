import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { InspectionWorkPage, type InspectionWorkInput } from '../inspection-work/inspection-work.page';
import { ProfilingSettingsPage, type ProfilingSettingsInput } from '../profiling-settings/profiling-settings.page';
import { executeAndVerifyInspectionJob } from './job-execution.flow';
import type { JobExecutionInput } from './job-execution.page';

test('TC-010 프로파일링 점검작업을 즉시실행하고 모니터링한다', async ({ page }) => {
  const loginData = await loadTestData<{ credentials: LoginEnvironmentReferences }>('login.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');
  const workData = await loadTestData<{ input: InspectionWorkInput }>('inspection-work.yml');
  const executionData = await loadTestData<{ input: JobExecutionInput }>('job-execution.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');
  test.setTimeout(executionData.input.completionTimeoutMs + 120000);

  await openQualityManagement(page, loginData.credentials);
  const profilingPage = new ProfilingSettingsPage(page);
  await profilingPage.open();
  await profilingPage.search(profilingData.input);
  const target = await profilingPage.latestTarget(profilingData.input);
  await profilingPage.selectTarget(target);
  const columns = await profilingPage.configuredColumns();
  const workPage = new InspectionWorkPage(page);
  await workPage.open();
  const jobName = await workPage.latestJobName(workData.input);
  const { status, results } = await executeAndVerifyInspectionJob(
    page, executionData.input, jobName, target, columns
  );
  expect(status.progress).toBe(executionData.input.completedProgress);
  expect(results).toHaveLength(columns.length);
});
