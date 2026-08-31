import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

type Options = { outputDir?: string };

function safeFilePart(value: string) {
  return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_').slice(0, 120);
}

function output(chunks: Array<string | Buffer>) {
  return chunks.map((chunk) => (Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk)).join('');
}

function attachmentText(result: TestResult) {
  return result.attachments
    .map((attachment) => {
      const location = attachment.path ?? '[inline attachment]';
      const body = attachment.body && attachment.contentType.startsWith('text/')
        ? `\n${attachment.body.toString('utf8')}`
        : '';
      return `- ${attachment.name} (${attachment.contentType}): ${location}${body}`;
    })
    .join('\n');
}

function kstDate(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(value);
}

function analyzeFailure(result: TestResult) {
  const evidence = [
    ...result.errors.map((error) => error.stack ?? error.message ?? String(error)),
    output(result.stdout),
    output(result.stderr),
    attachmentText(result)
  ].join('\n');

  if (/Timeout|timeout exceeded|waiting on the predicate/i.test(evidence)) {
    return {
      category: '타임아웃',
      cause: '지정한 시간 안에 대상 요소나 기대 상태가 나타나지 않았습니다.',
      action: '실패 로그의 locator와 대기 대상을 확인하고, 화면 갱신·네트워크 지연·조건 누락 여부를 점검합니다.'
    };
  }
  if (/expect\(received\)|Expected:|toBe\(|toContain\(|toHave/i.test(evidence)) {
    return {
      category: '검증 불일치',
      cause: '실제 UI 값이 테스트의 기대값과 다릅니다.',
      action: '실제 응답 또는 화면 상태가 요구사항 변경인지 데이터 문제인지 확인한 뒤 기대값이나 흐름을 수정합니다.'
    };
  }
  if (/pageerror|console\.error|Unhandled|uncaught/i.test(evidence)) {
    return {
      category: '브라우저 런타임 오류',
      cause: '페이지 JavaScript 오류 또는 브라우저 콘솔 오류가 감지됐습니다.',
      action: '첨부된 browser-errors 내용을 기준으로 오류가 테스트 대상 결함인지 자동화 타이밍 문제인지 분리합니다.'
    };
  }
  if (/net::|ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ECONNRESET|network/i.test(evidence)) {
    return {
      category: '네트워크 오류',
      cause: '페이지 또는 API에 연결하지 못했습니다.',
      action: '대상 URL 접근성, 인증 세션, 서버 상태를 확인한 뒤 동일 TC를 재실행합니다.'
    };
  }
  return {
    category: '원인 미분류',
    cause: '자동 분류 규칙에서 명확한 오류 유형을 찾지 못했습니다.',
    action: 'Errors·Stdout·Stderr·Attachments를 순서대로 확인해 최초 실패 지점을 분석합니다.'
  };
}

export default class FailureLogReporter implements Reporter {
  private readonly outputDir: string;

  constructor(options: Options = {}) {
    this.outputDir = path.resolve(options.outputDir ?? 'logs/test-errors');
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === test.expectedStatus && result.errors.length === 0) return;

    const dateDir = path.join(this.outputDir, kstDate(result.startTime));
    await mkdir(dateDir, { recursive: true });
    const project = test.parent.project()?.name ?? 'unknown-project';
    const timestamp = result.startTime.toISOString().replace(/[:.]/g, '-');
    const title = test.titlePath().join(' > ');
    const filename = `${timestamp}__${project}__retry-${result.retry}__${safeFilePart(title)}.log`;
    const analysis = analyzeFailure(result);
    const errors = result.errors
      .map((error, index) => `[${index + 1}] ${error.stack ?? error.message ?? String(error)}`)
      .join('\n\n');

    const log = [
      `Test: ${title}`,
      `Project: ${project}`,
      `Status: ${result.status}`,
      `Expected: ${test.expectedStatus}`,
      `Retry: ${result.retry}`,
      `Started: ${result.startTime.toISOString()}`,
      `DurationMs: ${result.duration}`,
      '',
      'Failure analysis:',
      `Category: ${analysis.category}`,
      `Likely cause: ${analysis.cause}`,
      `Recommended action: ${analysis.action}`,
      '',
      'Errors:', errors || '(no error details)',
      '',
      'Stdout:', output(result.stdout) || '(empty)',
      '',
      'Stderr:', output(result.stderr) || '(empty)',
      '',
      'Attachments:', attachmentText(result) || '(none)',
      ''
    ].join('\n');

    await writeFile(path.join(dateDir, filename), log, 'utf8');
  }
}
