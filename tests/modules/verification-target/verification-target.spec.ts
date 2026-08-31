import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { reflectVerificationTargets } from './verification-target.flow';
import type { VerificationTargetInput } from './verification-target.page';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
};

type VerificationTargetTestData = {
  input: VerificationTargetInput;
};

test('TC-005 미반영 검증대상 상위 1건을 업무에 반영한다', async ({ page }) => {
  const loginData = await loadTestData<LoginTestData>('login.yml');
  const targetData = await loadTestData<VerificationTargetTestData>('verification-target.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const { candidates, alertMessage } = await reflectVerificationTargets(
    page,
    loginData.credentials,
    targetData.input
  );

  expect(candidates).toHaveLength(targetData.input.selectionCount);
  expect(alertMessage).not.toBe('');
});
