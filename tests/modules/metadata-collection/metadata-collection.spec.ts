import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import {
  registerMetadataCollection
} from './metadata-collection.flow';
import type { MetadataCollectionInput } from './metadata-collection.page';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
};

type MetadataCollectionTestData = {
  input: MetadataCollectionInput;
};

test('TC-003 메타데이터 수집 예약을 신규 등록한다', async ({ page }) => {
  test.setTimeout(60000);
  const loginData = await loadTestData<LoginTestData>('login.yml');
  const collectionData = await loadTestData<MetadataCollectionTestData>('metadata-collection.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const { metadataCollectionPage, reservationName } = await registerMetadataCollection(
    page,
    loginData.credentials,
    collectionData.input
  );

  await expect(metadataCollectionPage.registrationDialog).toBeHidden();
  const savedRow = metadataCollectionPage.reservationRow(reservationName);
  await expect(savedRow).toContainText(collectionData.input.collectionTarget);
  await expect(savedRow).toContainText(reservationName);
  await expect(savedRow).toContainText(collectionData.input.cycleType);
  await expect(savedRow).toContainText(collectionData.input.executionDate);
  await expect(savedRow).toContainText(`${collectionData.input.hour}시 ${collectionData.input.minute}분`);
});
