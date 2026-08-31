import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { ProfilingSettingsPage, type ProfilingSettingsInput } from '../profiling-settings/profiling-settings.page';
import { applyMappingRulesAndRerun } from './column-analysis.flow';
import {
  ColumnAnalysisPage,
  type ColumnAnalysisInput,
  type ColumnExecutionInput,
  type MappingRuleInput
} from './column-analysis.page';

test('TC-008 실행 컬럼에 매핑룰을 적용하고 다시 실행한다', async ({ page }) => {
  const loginData = await loadTestData<{ credentials: LoginEnvironmentReferences }>('login.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');
  const analysisData = await loadTestData<{
    input: ColumnAnalysisInput;
    mappingRule: MappingRuleInput;
    execution: ColumnExecutionInput;
  }>('column-analysis.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  await openQualityManagement(page, loginData.credentials);
  const profilingPage = new ProfilingSettingsPage(page);
  await profilingPage.open();
  await profilingPage.search(profilingData.input);
  const target = await profilingPage.latestTarget(profilingData.input);
  await profilingPage.selectTarget(target);
  const checkedColumns = await profilingPage.configuredColumns();

  const columnAnalysisPage = new ColumnAnalysisPage(page);
  await columnAnalysisPage.open();
  const { applied } = await applyMappingRulesAndRerun(
    page,
    analysisData.input,
    analysisData.mappingRule,
    target,
    checkedColumns,
    analysisData.execution
  );
  expect(applied).toHaveLength(checkedColumns.length);
});
