import type { Page } from '@playwright/test';

export class QualityManagementPage {
  constructor(private readonly page: Page) {}

  get qualityCard() {
    return this.page.locator('a.side.link.item.QUALITY');
  }

  get dashboardTab() {
    return this.page.getByRole('tab', { name: '대시보드' });
  }

  menuLink(name: string) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.getByRole('link', { name: new RegExp(`${escapedName}$`) });
  }

  async openFromPortal() {
    await this.qualityCard.waitFor({ state: 'visible' });
    await this.qualityCard.click();
  }
}
