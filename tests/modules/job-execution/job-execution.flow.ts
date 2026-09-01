import { expect, type Page } from '@playwright/test';
import type { ProfilingColumnTarget, ProfilingTarget } from '../profiling-settings/profiling-settings.page';
import { JobExecutionPage, type JobExecutionInput } from './job-execution.page';

export async function executeAndVerifyInspectionJob(
  page: Page,
  input: JobExecutionInput,
  jobName: string,
  target: ProfilingTarget,
  expectedColumns: ProfilingColumnTarget[]
) {
  const executionPage = new JobExecutionPage(page);
  await executionPage.open();
  await executionPage.search(input, jobName);
  const executionStartedAt = new Date();
  const message = await executionPage.runImmediately(jobName);
  const status = await executionPage.waitForCompletion(input, jobName, executionStartedAt);
  await executionPage.openMonitoring(jobName);
  const expectedIds = [...new Set(expectedColumns.map((column) => column.columnId))].sort();
  await expect.poll(async () => {
    const loaded = (await executionPage.monitoringResults()).filter(
      (result) => result.tableId === target.tableId
    );
    return [...new Set(loaded.map((result) => result.columnId))].sort();
  }, {
    timeout: 15000,
    intervals: [100, 250, 500],
    message: `TC-010 모니터링 컬럼 결과가 로드되지 않았습니다: ${target.tableId}`
  }).toEqual(expectedIds);
  const results = (await executionPage.monitoringResults()).filter(
    (result) => result.tableId === target.tableId
  );
  const actualIds = [...new Set(results.map((result) => result.columnId))].sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`TC-010 모니터링 컬럼ID 불일치. expected=${expectedIds.join(',')} actual=${actualIds.join(',')}`);
  }
  const incomplete = results.find((result) =>
    !result.startedAt || !result.endedAt || result.processStatus !== input.completedStatus
  );
  if (incomplete) throw new Error(`TC-010 미완료 모니터링 결과: ${JSON.stringify(incomplete)}`);
  return { executionPage, status, results, message };
}
