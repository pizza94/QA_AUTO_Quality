import type { Page } from '@playwright/test';
import type { ProfilingTarget } from '../profiling-settings/profiling-settings.page';
import { InspectionWorkPage, type InspectionWorkInput } from './inspection-work.page';

export async function registerProfilingInspectionWork(
  page: Page,
  input: InspectionWorkInput,
  target: ProfilingTarget
) {
  const workPage = new InspectionWorkPage(page);
  await workPage.open();
  const jobName = await workPage.nextJobName(input.jobNamePrefix);
  await workPage.openProfilingRegistration();
  await workPage.fillJob(jobName, input);
  await workPage.searchTarget(input, target);
  await workPage.addTarget(target);
  const saveMessage = await workPage.save();
  await workPage.returnAndVerify(jobName);
  return { workPage, jobName, saveMessage };
}
