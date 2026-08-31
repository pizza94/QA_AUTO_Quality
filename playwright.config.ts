import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 480000,
  expect: { timeout: 10000 },
  use: {
    actionTimeout: 15000,
    navigationTimeout: 30000,
    baseURL: process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'https://example.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html'], ['github'], ['./reporters/failure-log-reporter.ts', { outputDir: 'logs/test-errors' }], ['./reporters/run-metadata-reporter.ts']]
    : [['list'], ['html'], ['./reporters/failure-log-reporter.ts', { outputDir: 'logs/test-errors' }], ['./reporters/run-metadata-reporter.ts']],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
