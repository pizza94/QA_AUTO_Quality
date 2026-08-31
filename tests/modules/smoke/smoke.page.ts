import type { Page } from '@playwright/test';

export class SmokePage {
  constructor(private readonly page: Page) {}

  async open() {
    return this.page.goto('/');
  }

  get body() {
    return this.page.locator('body');
  }
}
