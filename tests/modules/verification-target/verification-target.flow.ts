import type { Page } from '@playwright/test';
import type { LoginEnvironmentReferences } from '../../support/environment';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { VerificationTargetPage, type VerificationTargetInput } from './verification-target.page';

export async function reflectVerificationTargets(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences,
  input: VerificationTargetInput
) {
  await openQualityManagement(page, loginEnvironment);
  const verificationTargetPage = new VerificationTargetPage(page);
  await verificationTargetPage.open();
  await verificationTargetPage.search(input);
  const candidates = await verificationTargetPage.topCandidates(input);
  await verificationTargetPage.selectCandidates(candidates);
  await verificationTargetPage.openRegistration();
  const alertMessage = await verificationTargetPage.register(input.system, input.business);
  await verificationTargetPage.verifyReflected(candidates, input);

  return { verificationTargetPage, candidates, alertMessage };
}
