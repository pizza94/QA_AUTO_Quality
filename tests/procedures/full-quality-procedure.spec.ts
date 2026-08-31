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
  type ProfilingSettingsInput
} from '../modules/profiling-settings/profiling-settings.page';

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
  };
};

test('전체 QualityStream TC를 하나의 세션에서 순서대로 수행한다', async ({ page }) => {
  const loginData = await loadTestData<LoginData>('login.yml');
  const qualityData = await loadTestData<QualityData>('quality-management.yml');
  const collectionData = await loadTestData<CollectionData>('metadata-collection.yml');
  const targetData = await loadTestData<{ input: VerificationTargetInput }>('verification-target.yml');
  const profilingData = await loadTestData<{ input: ProfilingSettingsInput }>('profiling-settings.yml');

  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');
  test.setTimeout(collectionData.immediateExecution.completionTimeoutMs + 180000);

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

    await expect.poll(async () => {
      await collectionPage.refreshList();
      const status = (await collectionPage.reservationStatus(reservationName).innerText()).trim();
      await collectionPage.selectReservation(reservationName);
      await collectionPage.openCollectionHistory();
      const historyCount = await collectionPage.collectionHistoryRows.count();
      const historyStatus = historyCount
        ? (await collectionPage.latestCollectionHistoryStatus.innerText()).trim()
        : '';
      return status === collectionData.immediateExecution.completedStatus
        && historyCount > historyCountBefore
        && historyStatus === collectionData.immediateExecution.completedStatus;
    }, { timeout: collectionData.immediateExecution.completionTimeoutMs }).toBe(true);
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
    expect(target.tableId).not.toBe('');
  });
});
