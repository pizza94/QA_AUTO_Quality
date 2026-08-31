import type { Page } from '@playwright/test';

export class QualityManagementPage {
  constructor(private readonly page: Page) {}

  get qualityCard() {
    return this.page.getByText('품질관리', { exact: true }).filter({ visible: true });
  }

  get dashboardTab() {
    return this.page.getByRole('tab', { name: '대시보드' });
  }

  menuLink(name: string) {
    return this.page.getByText(name, { exact: true }).filter({ visible: true });
  }

  async openFromPortal() {
    await this.qualityCard.waitFor({ state: 'visible' });
    await this.qualityCard.click();
  }
}
