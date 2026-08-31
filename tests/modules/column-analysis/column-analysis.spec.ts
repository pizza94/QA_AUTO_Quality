import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { ProfilingSettingsPage, type ProfilingSettingsInput } from '../profiling-settings/profiling-settings.page';
import { verifyConfiguredColumnsInAnalysis } from './column-analysis.flow';
import type { ColumnAnalysisInput } from './column-analysis.page';

test('TC-007 TC-006 설정 컬럼을 컬럼분석에서 확인하고 실행한다', async ({ page }) => {
  const loginData = await loadTestData<{ credentials: LoginEnvironmentReferences }>('login.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');
  const analysisData = await loadTestData<{ input: ColumnAnalysisInput }>('column-analysis.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  await openQualityManagement(page, loginData.credentials);
  const profilingPage = new ProfilingSettingsPage(page);
  await profilingPage.open();
  await profilingPage.search(profilingData.input);
  const target = await profilingPage.latestTarget(profilingData.input);
  await profilingPage.selectTarget(target);
  const checkedColumns = await profilingPage.configuredColumns();
  const { results } = await verifyConfiguredColumnsInAnalysis(
    page, analysisData.input, target, checkedColumns
  );

  expect(results).toHaveLength(checkedColumns.length);
});
