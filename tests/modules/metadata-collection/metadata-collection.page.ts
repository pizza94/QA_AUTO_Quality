import type { Page } from '@playwright/test';

export type MetadataCollectionInput = {
  reservationNamePrefix: string;
  collectionTarget: string;
  database: string;
  cycleType: string;
  executionDate: string;
  timeType: string;
  hour: string;
  minute: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MetadataCollectionPage {
  constructor(private readonly page: Page) {}

  get targetManagementMenu() {
    return this.page.locator('a.menu-item').filter({ hasText: '검증대상관리' });
  }

  get metadataCollectionLink() {
    return this.page.getByRole('link', { name: '메타데이터수집관리', exact: true });
  }

  get metadataCollectionTab() {
    return this.page.getByRole('tab', { name: '메타데이터수집관리' });
  }

  get newButton() {
    return this.page.getByRole('button', { name: /신규$/ });
  }

  get registrationDialog() {
    return this.page.getByRole('dialog', { name: '메타데이터수집 등록' });
  }

  get reservationNameInput() {
    return this.registrationDialog.locator('input[name="extrtRsvNm"]');
  }

  get collectionTargetSelect() {
    return this.registrationDialog.locator('#metaCltnTrgtSelect');
  }

  get databaseSelect() {
    return this.registrationDialog.locator('#metaDbInfoSelect');
  }

  get cycleTypeSelect() {
    return this.registrationDialog.locator('#execCyclTypeSelect');
  }

  get executionDateInput() {
    return this.registrationDialog.locator('#exec_startDate');
  }

  get timeTypeSelect() {
    return this.registrationDialog.locator('#execTimeTypeSelect');
  }

  get hourSelect() {
    return this.registrationDialog.locator('#hour');
  }

  get minuteSelect() {
    return this.registrationDialog.locator('#timeType-S-minute');
  }

  get saveButton() {
    return this.registrationDialog.getByRole('button', { name: '저장', exact: true });
  }

  async open() {
    await this.targetManagementMenu.click();
    await this.metadataCollectionLink.click();
    await this.metadataCollectionTab.waitFor({ state: 'visible' });
  }

  async nextReservationName(prefix: string) {
    const names = await this.page.locator('#metaDataGrid .slick-cell.l3.r3').allTextContents();
    const matcher = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`);
    const maxSuffix = names.reduce((max, name) => {
      const match = name.trim().match(matcher);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `${prefix}${maxSuffix + 1}`;
  }

  async openNewRegistration() {
    await this.newButton.click();
    await this.registrationDialog.waitFor({ state: 'visible' });
  }

  async fillRegistration(reservationName: string, input: MetadataCollectionInput) {
    await this.reservationNameInput.fill(reservationName);
    await this.collectionTargetSelect.selectOption({ label: input.collectionTarget });
    await this.databaseSelect.selectOption({ label: input.database });
    await this.cycleTypeSelect.selectOption({ label: input.cycleType });
    await this.executionDateInput.fill(input.executionDate);
    await this.timeTypeSelect.selectOption({ label: input.timeType });
    await this.hourSelect.selectOption({ label: input.hour });
    await this.minuteSelect.selectOption({ label: input.minute });
  }

  async save() {
    await this.saveButton.click();
  }

  reservationRow(reservationName: string) {
    const exactName = new RegExp(`^${escapeRegExp(reservationName)}$`);
    const nameCell = this.page.locator('.slick-cell.l3.r3').filter({ hasText: exactName });
    return this.page.locator('#metaDataGrid .slick-row').filter({ has: nameCell });
  }
}
