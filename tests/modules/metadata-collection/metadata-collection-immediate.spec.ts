import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { runLatestMetadataCollection } from './metadata-collection.flow';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
};

type ImmediateExecutionTestData = {
  immediateExecution: {
    reservationNamePrefix: string;
    runningStatus: string;
    completedStatus: string;
    completionTimeoutMs: number;
  };
};

test('TC-004 최신 메타데이터 수집 예약을 즉시실행한다', async ({ page }) => {
  const loginData = await loadTestData<LoginTestData>('login.yml');
  const collectionData = await loadTestData<ImmediateExecutionTestData>('metadata-collection.yml');
  test.setTimeout(collectionData.immediateExecution.completionTimeoutMs + 60000);
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const { metadataCollectionPage, reservationName, historyCountBefore } =
    await runLatestMetadataCollection(
      page,
      loginData.credentials,
      collectionData.immediateExecution.reservationNamePrefix
    );

  await expect
    .poll(
      async () => {
        await metadataCollectionPage.refreshList();
        const status = (
          await metadataCollectionPage.reservationStatus(reservationName).innerText()
        ).trim();

        if (status === collectionData.immediateExecution.runningStatus) {
          return true;
        }

        await metadataCollectionPage.selectReservation(reservationName);
        await metadataCollectionPage.openCollectionHistory();
        const historyCount = await metadataCollectionPage.collectionHistoryRows.count();
        const latestHistoryStatus = historyCount
          ? (await metadataCollectionPage.latestCollectionHistoryStatus.innerText()).trim()
          : '';

        return status === collectionData.immediateExecution.completedStatus
          && historyCount > historyCountBefore
          && latestHistoryStatus === collectionData.immediateExecution.completedStatus;
      },
      { timeout: collectionData.immediateExecution.completionTimeoutMs }
    )
    .toBe(true);

  await expect
    .poll(
      async () => {
        await metadataCollectionPage.refreshList();
        const status = (
          await metadataCollectionPage.reservationStatus(reservationName).innerText()
        ).trim();
        await metadataCollectionPage.selectReservation(reservationName);
        await metadataCollectionPage.openCollectionHistory();
        const historyCount = await metadataCollectionPage.collectionHistoryRows.count();
        const latestHistoryStatus = historyCount
          ? (await metadataCollectionPage.latestCollectionHistoryStatus.innerText()).trim()
          : '';

        return status === collectionData.immediateExecution.completedStatus
          && historyCount > historyCountBefore
          && latestHistoryStatus === collectionData.immediateExecution.completedStatus;
      },
      { timeout: collectionData.immediateExecution.completionTimeoutMs }
    )
    .toBe(true);

  await expect(metadataCollectionPage.collectionHistoryTab).toHaveAttribute('aria-selected', 'true');
});
