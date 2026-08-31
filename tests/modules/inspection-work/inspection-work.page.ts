import type { Page } from '@playwright/test';
import type { ProfilingTarget } from '../profiling-settings/profiling-settings.page';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type InspectionWorkInput = {
  jobNamePrefix: string;
  verificationType: string;
  description: string;
  system: string;
  business: string;
  exactTableSearchOption: string;
};

export class InspectionWorkPage {
  constructor(private readonly page: Page) {}

  get manageRegion() {
    return this.page.locator('#manageRegion');
  }

  get registrationRegion() {
    return this.page.locator('#profilingJobManage-createRegion');
  }

  get workManagementMenu() {
    return this.page.locator('a.menu-item#jobMngt');
  }

  get inspectionWorkLink() {
    return this.page.locator('a[href="/quality_woori/job/jobMain#manage"]');
  }

  get manageTab() {
    return this.page.getByRole('tab', { name: '점검작업관리' }).filter({ visible: true });
  }

  get searchButton() {
    return this.manageRegion.locator('#manageSearch').getByRole('button', { name: '검색', exact: true });
  }

  get jobNameCells() {
    return this.manageRegion.locator('#manageGrid .slick-cell.l3.r3');
  }

  get profilingRegistrationButton() {
    return this.manageRegion.locator('#manageProfilingButton');
  }

  get saveButton() {
    return this.registrationRegion.locator('#profilingJobSaveButton');
  }

  async open() {
    if (!(await this.inspectionWorkLink.isVisible())) await this.workManagementMenu.click();
    await this.inspectionWorkLink.click();
    await this.manageTab.waitFor({ state: 'visible' });
    await this.searchButton.click();
  }

  async nextJobName(prefix: string) {
    const matcher = new RegExp(`^${escapeRegExp(prefix)}(\\d+)$`);
    const names = await this.jobNameCells.allTextContents();
    const max = names.reduce((current, name) => {
      const match = name.trim().match(matcher);
      return match ? Math.max(current, Number(match[1])) : current;
    }, 0);
    return `${prefix}${max + 1}`;
  }

  async openProfilingRegistration() {
    await this.profilingRegistrationButton.click();
    await this.page.getByRole('tab', { name: '점검작업등록(프로파일링)' }).filter({ visible: true })
      .waitFor({ state: 'visible' });
  }

  async fillJob(jobName: string, input: InspectionWorkInput) {
    await this.registrationRegion.locator('#verificationType').selectOption({ label: input.verificationType });
    await this.registrationRegion.locator('#profilingJobInfo input#name').fill(jobName);
    await this.registrationRegion.locator('#profilingJobInfo textarea#description').fill(input.description);
  }

  async searchTarget(input: InspectionWorkInput, target: ProfilingTarget) {
    const search = this.registrationRegion.locator('#tableListSearch');
    await search.locator('#systemSelect').selectOption({ label: input.system });
    await search.locator('#businessSelect').locator('option', { hasText: input.business })
      .waitFor({ state: 'attached' });
    await search.locator('#businessSelect').selectOption({ label: input.business });
    await search.locator('input#name').fill(target.tableId);
    await search.locator('select[name="tableSearchOption"]').selectOption({
      label: input.exactTableSearchOption
    });
    await search.getByRole('button', { name: '검색', exact: true }).click();
    await this.tableRow(target.tableId).waitFor({ state: 'visible' });
  }

  tableRow(tableId: string) {
    const idCell = this.page.locator('.slick-cell.l7.r7').filter({
      hasText: new RegExp(`^${escapeRegExp(tableId)}$`)
    });
    return this.registrationRegion.locator('#tableGrid .slick-row').filter({ has: idCell });
  }

  selectedTableRow(tableId: string) {
    const idCell = this.page.locator('.slick-cell.l7.r7').filter({
      hasText: new RegExp(`^${escapeRegExp(tableId)}$`)
    });
    return this.registrationRegion.locator('#selectTableListGrid .slick-row').filter({ has: idCell });
  }

  async addTarget(target: ProfilingTarget) {
    const checkbox = this.tableRow(target.tableId).getByRole('checkbox');
    if (!(await checkbox.isChecked())) await checkbox.click();
    await this.registrationRegion.locator('#tableAddListButton').click();
    await this.selectedTableRow(target.tableId).waitFor({ state: 'visible' });
  }

  async save() {
    let message = '';
    const acceptDialog = async (dialog: import('@playwright/test').Dialog) => {
      message = dialog.message();
      await dialog.accept();
    };
    this.page.on('dialog', acceptDialog);
    try {
      await this.saveButton.click();
      await this.page.waitForTimeout(500);
      const confirmButton = this.page.getByRole('button', { name: '확인', exact: true }).filter({ visible: true });
      if (await confirmButton.count()) await confirmButton.last().click();
      return message;
    } finally {
      this.page.off('dialog', acceptDialog);
    }
  }

  jobRow(jobName: string) {
    const nameCell = this.page.locator('.slick-cell.l3.r3').filter({
      hasText: new RegExp(`^${escapeRegExp(jobName)}$`)
    });
    return this.manageRegion.locator('#manageGrid .slick-row').filter({ has: nameCell });
  }

  async returnAndVerify(jobName: string) {
    await this.manageTab.click();
    await this.manageRegion.locator('input[name="name"]').fill(jobName);
    await this.searchButton.click();
    await this.jobRow(jobName).waitFor({ state: 'visible' });
  }
}
