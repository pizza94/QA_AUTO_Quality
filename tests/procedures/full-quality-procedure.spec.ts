import { test, expect } from '../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../support/environment';
import { loadTestData } from '../support/test-data';
import { login } from '../modules/login/login.flow';
import { QualityManagementPage } from '../modules/quality-management/quality-management.page';
import {
  MetadataCollectionPage,
  type MetadataCollectionInput
} from '../modules/metadata-collection/metadata-collection.page';
import {
  VerificationTargetPage,
  type VerificationTargetInput
} from '../modules/verification-target/verification-target.page';
import {
  ProfilingSettingsPage,
  type ProfilingSettingsInput,
  type ProfilingTarget,
  type ProfilingColumnTarget
} from '../modules/profiling-settings/profiling-settings.page';
import {
  applyMappingRulesAndRerun,
  verifyConfiguredColumnsInAnalysis
} from '../modules/column-analysis/column-analysis.flow';
import type {
  ColumnAnalysisInput,
  ColumnExecutionInput,
  MappingRuleInput
} from '../modules/column-analysis/column-analysis.page';
import { registerProfilingInspectionWork } from '../modules/inspection-work/inspection-work.flow';
import type { InspectionWorkInput } from '../modules/inspection-work/inspection-work.page';

type LoginData = {
  credentials: LoginEnvironmentReferences;
  expected: { landingHeading: string; urlMustNotContain: string };
};

type QualityData = {
  expected: { pageTitle: string; urlContains: string; primaryMenus: string[] };
};

type CollectionData = {
  input: MetadataCollectionInput;
  immediateExecution: {
    reservationNamePrefix: string;
    runningStatus: string;
    completedStatus: string;
    completionTimeoutMs: number;
    uiPollIntervalMs: number;
  };
};

test('전체 QualityStream TC를 하나의 세션에서 순서대로 수행한다', async ({ page }) => {
  const loginData = await loadTestData<LoginData>('login.yml');
  const qualityData = await loadTestData<QualityData>('quality-management.yml');
  const collectionData = await loadTestData<CollectionData>('metadata-collection.yml');
  const targetData = await loadTestData<{ input: VerificationTargetInput }>('verification-target.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');
  const columnAnalysisData = await loadTestData<{
    input: ColumnAnalysisInput;
    mappingRule: MappingRuleInput;
    execution: ColumnExecutionInput;
  }>('column-analysis.yml');
  const inspectionWorkData = await loadTestData<{ input: InspectionWorkInput }>(
    'inspection-work.yml'
  );

  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');
  test.setTimeout(
    collectionData.immediateExecution.completionTimeoutMs
    + (columnAnalysisData.execution.completionTimeoutMs * 2)
    + 180000
  );

  await test.step('TC-001 로그인', async () => {
    const loginPage = await login(page, loginData.credentials);
    await expect(loginPage.loginButton).toBeHidden();
    await expect(page.getByRole('heading', { name: loginData.expected.landingHeading })).toBeVisible();
    expect(page.url()).not.toContain(loginData.expected.urlMustNotContain);
  });

  const qualityPage = new QualityManagementPage(page);
  await test.step('TC-002 품질관리 진입', async () => {
    await qualityPage.openFromPortal();
    await expect(page).toHaveTitle(qualityData.expected.pageTitle);
    expect(page.url()).toContain(qualityData.expected.urlContains);
    await expect(qualityPage.dashboardTab).toBeVisible();
    for (const menuName of qualityData.expected.primaryMenus) {
      await expect(qualityPage.menuLink(menuName)).toBeVisible();
    }
  });

  const collectionPage = new MetadataCollectionPage(page);
  let reservationName = '';
  await test.step('TC-003 메타데이터 수집 예약 등록', async () => {
    await collectionPage.open();
    reservationName = await collectionPage.nextReservationName(collectionData.input.reservationNamePrefix);
    await collectionPage.openNewRegistration();
    await collectionPage.fillRegistration(reservationName, collectionData.input);
    await collectionPage.save();
    await expect(collectionPage.registrationDialog).toBeHidden();
    await expect(collectionPage.reservationRow(reservationName)).toContainText(reservationName);
  });

  await test.step('TC-004 방금 등록한 수집 예약 즉시실행', async () => {
    await collectionPage.selectReservation(reservationName);
    await collectionPage.openCollectionHistory();
    const historyCountBefore = await collectionPage.collectionHistoryRows.count();
    await collectionPage.closeDetails();
    await collectionPage.runImmediately();
    await collectionPage.waitForStatusViaSearch(
      reservationName,
      collectionData.immediateExecution.completedStatus,
      collectionData.immediateExecution.completionTimeoutMs,
      collectionData.immediateExecution.uiPollIntervalMs
    );
    await expect(collectionPage.reservationStatus(reservationName)).toHaveText(
      collectionData.immediateExecution.completedStatus
    );
    await collectionPage.selectReservation(reservationName);
    await collectionPage.openCollectionHistory();
    await expect(collectionPage.collectionHistoryRows).toHaveCount(historyCountBefore + 1);
    await expect(collectionPage.latestCollectionHistoryStatus).toHaveText(
      collectionData.immediateExecution.completedStatus
    );
  });

  await test.step('TC-005 검증대상 1건 반영', async () => {
    const targetPage = new VerificationTargetPage(page);
    await targetPage.open();
    await targetPage.search(targetData.input);
    const candidates = await targetPage.topCandidates(targetData.input);
    await targetPage.selectCandidates(candidates);
    await targetPage.openRegistration();
    const alertMessage = await targetPage.register(targetData.input.system, targetData.input.business);
    await targetPage.verifyReflected(candidates, targetData.input);
    expect(candidates).toHaveLength(targetData.input.selectionCount);
    expect(alertMessage).not.toBe('');
  });

  let profilingTarget: ProfilingTarget | undefined;
  let profilingColumns: ProfilingColumnTarget[] = [];
  await test.step('TC-006 테이블과 컬럼 프로파일링 설정', async () => {
    const profilingPage = new ProfilingSettingsPage(page);
    await profilingPage.open();
    await profilingPage.search(profilingData.input);
    const target = await profilingPage.latestTarget(profilingData.input);
    await profilingPage.selectTarget(target);
    await profilingPage.enableTableExecution();
    await profilingPage.reloadAndVerifyTableExecution(target, profilingData.input);
    await profilingPage.enableAllColumns();
    await profilingPage.reloadAndVerifyColumns(target, profilingData.input);
    profilingTarget = target;
    profilingColumns = await profilingPage.configuredColumns();
    expect(target.tableId).not.toBe('');
  });

  await test.step('TC-007 설정 컬럼의 컬럼분석 조회 결과 확인', async () => {
    if (!profilingTarget || !profilingColumns.length) {
      throw new Error('TC-006 프로파일링 대상 또는 컬럼 정보가 없습니다.');
    }
    const { results } = await verifyConfiguredColumnsInAnalysis(
      page,
      columnAnalysisData.input,
      profilingTarget,
      profilingColumns,
      columnAnalysisData.execution
    );
    expect(results).toHaveLength(profilingColumns.length);
  });

  await test.step('TC-008 실행 컬럼 매핑룰 적용 및 재실행', async () => {
    if (!profilingTarget || !profilingColumns.length) {
      throw new Error('TC-006 프로파일링 대상 또는 컬럼 정보가 없습니다.');
    }
    const { applied } = await applyMappingRulesAndRerun(
      page,
      columnAnalysisData.input,
      columnAnalysisData.mappingRule,
      profilingTarget,
      profilingColumns,
      columnAnalysisData.execution
    );
    expect(applied).toHaveLength(profilingColumns.length);
  });

  await test.step('TC-009 프로파일링 점검작업 등록 및 조회', async () => {
    if (!profilingTarget) throw new Error('TC-006 프로파일링 대상 정보가 없습니다.');
    const { workPage, jobName } = await registerProfilingInspectionWork(
      page,
      inspectionWorkData.input,
      profilingTarget
    );
    await expect(workPage.jobRow(jobName)).toContainText(jobName);
  });
});
