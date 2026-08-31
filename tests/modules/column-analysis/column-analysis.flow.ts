import type { Page } from '@playwright/test';
import type {
  ProfilingColumnTarget,
  ProfilingTarget
} from '../profiling-settings/profiling-settings.page';
import {
  ColumnAnalysisPage,
  type ColumnAnalysisInput,
  type MappingRuleInput
} from './column-analysis.page';

export async function verifyConfiguredColumnsInAnalysis(
  page: Page,
  input: ColumnAnalysisInput,
  target: ProfilingTarget,
  expectedColumns: ProfilingColumnTarget[]
) {
  const columnAnalysisPage = new ColumnAnalysisPage(page);
  await columnAnalysisPage.open();
  await columnAnalysisPage.search(input, target);
  const results = await columnAnalysisPage.results();
  const targetResults = results.filter((result) => result.tableId === target.tableId);

  if (!targetResults.length) throw new Error(`컬럼분석 조회 결과가 없습니다: ${target.tableId}`);
  const invalid = targetResults.find((result) =>
    (input.executionHistory === 'N' && (result.executedAt !== '' || result.jobStatus !== ''))
    || result.collectionTarget !== input.collectionTarget
    || result.system !== input.system
    || result.business !== input.business
    || result.database !== input.database
    || result.owner !== input.owner
  );
  if (invalid) throw new Error(`컬럼분석 조회 조건과 다른 결과가 포함됐습니다: ${JSON.stringify(invalid)}`);

  const actualIds = [...new Set(targetResults.map((result) => result.columnId))].sort();
  const expectedIds = [...new Set(expectedColumns.map((column) => column.columnId))].sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`TC-006 설정 컬럼과 컬럼분석 결과가 다릅니다. expected=${expectedIds.join(',')} actual=${actualIds.join(',')}`);
  }

  await columnAnalysisPage.selectColumns(expectedIds);
  const executionMessage = await columnAnalysisPage.runSelectedColumns();

  return { columnAnalysisPage, results: targetResults, executionMessage };
}

export async function applyMappingRulesAndRerun(
  page: Page,
  input: ColumnAnalysisInput,
  mappingInput: MappingRuleInput,
  target: ProfilingTarget,
  expectedColumns: ProfilingColumnTarget[]
) {
  const columnAnalysisPage = new ColumnAnalysisPage(page);
  await columnAnalysisPage.search(
    { ...input, executionHistory: mappingInput.executionHistory },
    target
  );
  const results = (await columnAnalysisPage.results()).filter(
    (result) => result.tableId === target.tableId
  );
  const expectedIds = [...new Set(expectedColumns.map((column) => column.columnId))].sort();
  const actualIds = [...new Set(results.map((result) => result.columnId))].sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`TC-008 컬럼ID 불일치. expected=${expectedIds.join(',')} actual=${actualIds.join(',')}`);
  }

  await columnAnalysisPage.selectColumns(expectedIds);
  const applied = await columnAnalysisPage.applyMappingRules(
    results,
    expectedIds,
    mappingInput.fallbackRule
  );
  if (applied.some(({ message }) => !/매핑룰.*변경/.test(message))) {
    throw new Error(`매핑룰 변경 확인 메시지가 올바르지 않습니다: ${JSON.stringify(applied)}`);
  }
  const executionMessage = await columnAnalysisPage.runSelectedColumns();
  return { results, applied, executionMessage };
}
