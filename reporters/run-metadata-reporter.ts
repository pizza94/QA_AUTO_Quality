import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

type RunRecord = {
  startedAt: string;
  finishedAt?: string;
  automationVersion: string;
  gitCommit: string;
  status?: string;
  tests: Array<{ title: string; status: string; durationMs: number }>;
};

export default class RunMetadataReporter implements Reporter {
  private record!: RunRecord;

  async onBegin() {
    const packageData = JSON.parse(await readFile(path.resolve('package.json'), 'utf8')) as {
      version: string;
    };
    let gitCommit = 'unknown';
    try {
      gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    } catch {
      // Git metadata is optional outside a repository checkout.
    }
    this.record = {
      startedAt: new Date().toISOString(),
      automationVersion: packageData.version,
      gitCommit,
      tests: []
    };
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.record.tests.push({ title: test.titlePath().join(' > '), status: result.status, durationMs: result.duration });
  }

  async onEnd(result: FullResult) {
    this.record.finishedAt = new Date().toISOString();
    this.record.status = result.status;
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    const outputDir = path.resolve('logs', 'test-runs', date);
    await mkdir(outputDir, { recursive: true });
    const filename = `${this.record.startedAt.replace(/[:.]/g, '-')}.json`;
    await writeFile(path.join(outputDir, filename), JSON.stringify(this.record, null, 2), 'utf8');
  }
}
