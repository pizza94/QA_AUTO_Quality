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

  get region() {
    return this.page.locator('#metaDataRegion');
  }

  get targetManagementMenu() {
    return this.page.locator('a.menu-item').filter({ hasText: '검증대상관리' });
  }

  get metadataCollectionLink() {
    return this.page.getByRole('link', { name: '메타데이터수집관리', exact: true });
  }

  get metadataCollectionTab() {
    return this.page.getByRole('tab', { name: '메타데이터수집관리' }).filter({ visible: true });
  }

  get reservationNameCells() {
    return this.region.locator('#metaDataGrid .slick-cell.l3.r3');
  }

  get newButton() {
    return this.region.getByRole('button', { name: /신규$/ });
  }

  get immediateRunButton() {
    return this.region.getByRole('button', { name: /즉시실행$/ });
  }

  get searchButton() {
    return this.region.locator('#metaDataSearch').getByRole('button', { name: '검색', exact: true });
  }

  get collectionHistoryTab() {
    return this.region.getByRole('tab', { name: '수집이력' });
  }

  get collectionHistoryRows() {
    return this.region.locator('#cltnHistoryGrid .slick-row');
  }

  get latestCollectionHistoryStatus() {
    return this.collectionHistoryRows.first().locator('.slick-cell.l8.r8');
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
    if (!(await this.metadataCollectionLink.isVisible())) {
      await this.targetManagementMenu.click();
    }
    await this.metadataCollectionLink.click();
    await this.metadataCollectionTab.waitFor({ state: 'visible' });
    await this.searchButton.click();
    await this.reservationNameCells.first().waitFor({ state: 'visible' });
  }

  private async numberedReservationNames(prefix: string) {
    const names = await this.reservationNameCells.allTextContents();
    const matcher = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`);
    return names.flatMap((name) => {
      const trimmedName = name.trim();
      const match = trimmedName.match(matcher);
      return match ? [{ name: trimmedName, suffix: Number(match[1]) }] : [];
    });
  }

  async nextReservationName(prefix: string) {
    const numberedNames = await this.numberedReservationNames(prefix);
    const maxSuffix = numberedNames.reduce((max, item) => Math.max(max, item.suffix), 0);

    return `${prefix}${maxSuffix + 1}`;
  }

  async latestReservationName(prefix: string) {
    const numberedNames = await this.numberedReservationNames(prefix);
    const latest = numberedNames.reduce<(typeof numberedNames)[number] | undefined>(
      (current, item) => (!current || item.suffix > current.suffix ? item : current),
      undefined
    );

    if (!latest) {
      throw new Error(`No reservation found with prefix: ${prefix}`);
    }

    return latest.name;
  }

  async openNewRegistration() {
    await this.newButton.click();
    await this.registrationDialog.waitFor({ state: 'visible' });
  }

  async fillRegistration(reservationName: string, input: MetadataCollectionInput) {
    await this.collectionTargetSelect.selectOption({ label: input.collectionTarget });
    await this.databaseSelect.selectOption({ label: input.database });
    await this.cycleTypeSelect.selectOption({ label: input.cycleType });
    await this.executionDateInput.fill(input.executionDate);
    await this.timeTypeSelect.selectOption({ label: input.timeType });
    await this.hourSelect.selectOption({ label: input.hour });
    await this.minuteSelect.selectOption({ label: input.minute });
    await this.reservationNameInput.fill(reservationName);
  }

  async save() {
    await this.saveButton.click();
    await this.registrationDialog.waitFor({ state: 'hidden' });
    await this.refreshList();
  }

  reservationRow(reservationName: string) {
    const exactName = new RegExp(`^${escapeRegExp(reservationName)}$`);
    const nameCell = this.region.locator('.slick-cell.l3.r3').filter({ hasText: exactName });
    return this.region.locator('#metaDataGrid .slick-row').filter({ has: nameCell });
  }

  reservationStatus(reservationName: string) {
    return this.reservationRow(reservationName).locator('.slick-cell.l8.r8');
  }

  async selectReservation(reservationName: string) {
    const checkbox = this.reservationRow(reservationName).getByRole('checkbox');
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }
  }

  async runImmediately() {
    this.page.once('dialog', async (dialog) => dialog.accept());
    await this.immediateRunButton.click();

    const confirmButton = this.page
      .getByRole('button', { name: '확인', exact: true })
      .filter({ visible: true });
    await confirmButton.waitFor({ state: 'visible', timeout: 1000 }).catch(() => undefined);
    if (await confirmButton.count()) {
      await confirmButton.last().click();
    }
  }

  async refreshList() {
    await this.searchButton.click();
    await this.reservationNameCells.first().waitFor({ state: 'visible' });
  }

  async openCollectionHistory() {
    const openDetailsButton = this.region.locator('.ui-layout-toggler-south[title="Open"]');
    if (await openDetailsButton.isVisible()) {
      await openDetailsButton.click();
    }

    await this.collectionHistoryTab.click();
    await this.region.locator('#cltnHistory').waitFor({ state: 'visible' });
  }

  async closeDetails() {
    const closeDetailsButton = this.region.locator('.ui-layout-toggler-south[title="Close"]');
    if (await closeDetailsButton.isVisible()) {
      await closeDetailsButton.click();
    }
  }
}
