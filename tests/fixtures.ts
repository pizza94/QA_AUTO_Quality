import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ captureBrowserErrors: void }>({
  captureBrowserErrors: [async ({ page }, use, testInfo) => {
    const logs: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        logs.push(`[console.${message.type()}] ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => logs.push(`[pageerror] ${error.stack ?? error.message}`));

    await use();

    if (testInfo.status !== testInfo.expectedStatus && logs.length) {
      await testInfo.attach('browser-errors', {
        body: Buffer.from(logs.join('\n'), 'utf8'),
        contentType: 'text/plain'
      });
    }
  }, { auto: true }]
});

export { expect };

