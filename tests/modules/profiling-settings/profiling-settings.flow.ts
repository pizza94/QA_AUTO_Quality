import type { Page } from '@playwright/test';
import type { LoginEnvironmentReferences } from '../../support/environment';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { ProfilingSettingsPage, type ProfilingSettingsInput } from './profiling-settings.page';

export async function enableLatestReflectedTableProfiling(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences,
  input: ProfilingSettingsInput
) {
  await openQualityManagement(page, loginEnvironment);
  const profilingSettingsPage = new ProfilingSettingsPage(page);
  await profilingSettingsPage.open();
  await profilingSettingsPage.search(input);
  const target = await profilingSettingsPage.latestTarget(input);
  await profilingSettingsPage.selectTarget(target);
  await profilingSettingsPage.enableTableExecution();
  await profilingSettingsPage.reselectTarget(target);
  await profilingSettingsPage.enableAllColumns();
  await profilingSettingsPage.verifySaved(target, input);

  return { target };
}
