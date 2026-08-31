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

export default class FailureLogReporter implements Reporter {
  private readonly outputDir: string;

  constructor(options: Options = {}) {
    this.outputDir = path.resolve(options.outputDir ?? 'logs/test-errors');
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === test.expectedStatus && result.errors.length === 0) return;

    await mkdir(this.outputDir, { recursive: true });
    const project = test.parent.project()?.name ?? 'unknown-project';
    const timestamp = result.startTime.toISOString().replace(/[:.]/g, '-');
    const title = test.titlePath().join(' > ');
    const filename = `${timestamp}__${project}__retry-${result.retry}__${safeFilePart(title)}.log`;
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
      'Errors:', errors || '(no error details)',
      '',
      'Stdout:', output(result.stdout) || '(empty)',
      '',
      'Stderr:', output(result.stderr) || '(empty)',
      '',
      'Attachments:', attachmentText(result) || '(none)',
      ''
    ].join('\n');

    await writeFile(path.join(this.outputDir, filename), log, 'utf8');
  }
}

