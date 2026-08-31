import { test, expect } from '../../fixtures';
import { hasLoginEnvironment, type LoginEnvironmentReferences } from '../../support/environment';
import { loadTestData } from '../../support/test-data';
import { enableLatestReflectedTableProfiling } from './profiling-settings.flow';
import type { ProfilingSettingsInput } from './profiling-settings.page';

type LoginTestData = {
  credentials: LoginEnvironmentReferences;
};

type ProfilingSettingsTestData = {
  input: ProfilingSettingsInput;
};

test('TC-006 최근 반영 테이블 1건과 모든 컬럼의 프로파일링 실행을 설정한다', async ({ page }) => {
  test.setTimeout(30000);
  const loginData = await loadTestData<LoginTestData>('login.yml');
  const profilingData = await loadTestData<ProfilingSettingsTestData>('profiling-settings.yml');
  test.skip(!hasLoginEnvironment(loginData.credentials), '로그인 환경변수가 설정되지 않았습니다.');

  const { target } = await enableLatestReflectedTableProfiling(
    page,
    loginData.credentials,
    profilingData.input
  );

  expect(target.tableId).not.toBe('');
});
