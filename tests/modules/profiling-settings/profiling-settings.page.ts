import type { Page } from '@playwright/test';

export type ProfilingSettingsInput = {
  system: string;
  business: string;
  collectionTargetOption: string;
  collectionTargetGridValue: string;
  database: string;
  owner: string;
  currentExecutionStatus: string;
  expectedExecutionStatus: string;
};

type ProfilingTarget = {
  reflectedAt: string;
  tableId: string;
  tableName: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ProfilingSettingsPage {
  constructor(private readonly page: Page) {}

  get profilingSettingsMenu() {
    return this.page.locator('a.menu-item').filter({ hasText: '프로파일링설정' });
  }

  get tableLink() {
    return this.page.locator('a[href*="tableProfilingMain#tableProfiling"]').filter({ hasText: '테이블' });
  }

  get tableTab() {
    return this.page.getByRole('tab', { name: '테이블' });
  }

  get searchButton() {
    return this.page.locator('#tableMainRegion .search-panel-search-btn');
  }

  get rows() {
    return this.page.locator('#tableProfilingGrid .slick-row');
  }

  get basicInfoTab() {
    return this.page.getByRole('tab', { name: '기본정보' });
  }

  get columnsTab() {
    return this.page.getByRole('tab', { name: '컬럼' });
  }

  get tableExecutionCheckbox() {
    return this.page.locator('#basicInfo input[name="executeTabYn"]');
  }

  get columnRows() {
    return this.page.locator('#columnsGrid .slick-row');
  }

  async open() {
    await this.profilingSettingsMenu.click();
    await this.tableLink.click();
    await this.tableTab.waitFor({ state: 'visible' });
  }

  async search(input: ProfilingSettingsInput) {
    await this.page.locator('#systemSelect').selectOption({ label: input.system });
    await this.page.locator('#bizSelect').selectOption({ label: input.business });

    const additionalFilterButton = this.page.getByRole('button', {
      name: '추가필터 표시',
      exact: true
    });
    if (await additionalFilterButton.isVisible()) {
      await additionalFilterButton.click();
    }

    await this.page.locator('#metaCltnTrgt').selectOption({ label: input.collectionTargetOption });
    await this.page.locator('#dbNm').fill(input.database);
    await this.page.locator('input[name="owner"]').fill(input.owner);
    await this.page.locator('#tableExeYN').selectOption({ label: input.currentExecutionStatus });
    await this.searchButton.click();
    await this.rows.first().waitFor({ state: 'visible' });
  }

  async latestTarget(input: ProfilingSettingsInput): Promise<ProfilingTarget> {
    const targets = await this.rows.evaluateAll((rows, expected) => rows
      .map((row) => {
        const cellText = (index: number) =>
          row.querySelector(`.slick-cell.l${index}.r${index}`)?.textContent?.trim() ?? '';
        return {
          top: Number.parseFloat((row as HTMLElement).style.top || '0'),
          collectionTarget: cellText(2),
          reflectedAt: cellText(3),
          system: cellText(4),
          business: cellText(5),
          database: cellText(6),
          owner: cellText(7),
          tableName: cellText(8),
          tableId: cellText(9),
          executionStatus: cellText(16)
        };
      })
      .filter((row) =>
        row.collectionTarget === expected.collectionTargetGridValue
        && row.system === expected.system
        && row.business === expected.business
        && row.database === expected.database
        && row.owner === expected.owner
        && (
          expected.currentExecutionStatus === '전체'
          || row.executionStatus === expected.currentExecutionStatus
        )
      )
      .sort((left, right) => left.top - right.top)
      .map(({ reflectedAt, tableId, tableName }) => ({ reflectedAt, tableId, tableName })), input);

    if (!targets[0]) {
      throw new Error('No reflected profiling target matched the configured conditions.');
    }
    return targets[0];
  }

  rowByTableId(tableId: string) {
    const idCell = this.page.locator('.slick-cell.l9.r9').filter({
      hasText: new RegExp(`^${escapeRegExp(tableId)}$`)
    });
    return this.page.locator('#tableProfilingGrid .slick-row').filter({ has: idCell });
  }

  async selectTarget(target: ProfilingTarget) {
    const checkbox = this.rowByTableId(target.tableId).getByRole('checkbox');
    if (!(await checkbox.isChecked())) {
      await checkbox.click();
    }

    const openDetailsButton = this.page.locator('.ui-layout-toggler-south[title="Open"]');
    if (await openDetailsButton.isVisible()) {
      await openDetailsButton.click();
    }
  }

  private async save(buttonSelector: string) {
    const acceptDialog = async (dialog: import('@playwright/test').Dialog) => {
      await dialog.accept();
    };
    this.page.once('dialog', acceptDialog);
    await this.page.locator(buttonSelector).click();
    await this.page.waitForTimeout(300);
    this.page.off('dialog', acceptDialog);
  }

  async enableTableExecution() {
    await this.basicInfoTab.click();
    await this.tableExecutionCheckbox.setChecked(true);
    await this.save('#saveProfilingTable');
  }

  async reselectTarget(target: ProfilingTarget) {
    await this.page.locator('#tableExeYN').selectOption({ label: '전체' });
    await this.searchButton.click();
    const checkbox = this.rowByTableId(target.tableId).getByRole('checkbox');
    await checkbox.waitFor({ state: 'visible' });
    if (await checkbox.isChecked()) {
      await checkbox.click();
    }
    await checkbox.click();

    const openDetailsButton = this.page.locator('.ui-layout-toggler-south[title="Open"]');
    if (await openDetailsButton.isVisible()) {
      await openDetailsButton.click();
    }
  }

  async enableAllColumns() {
    await this.columnsTab.click();
    await this.columnRows.first().waitFor({ state: 'visible' });

    const selectAll = this.page.locator('#columnsGrid .slick-header input.select-all');
    await selectAll.nth(0).setChecked(true);
    await selectAll.nth(1).setChecked(true);

    const executionCheckboxes = this.page.locator('#columnsGrid input[name="executeYn"]');
    const columnCheckboxes = this.page.locator('#columnsGrid input[name="columnYn"]');
    const executionStates = await executionCheckboxes.evaluateAll((checkboxes) =>
      checkboxes.map((checkbox) => (checkbox as HTMLInputElement).checked));
    const columnStates = await columnCheckboxes.evaluateAll((checkboxes) =>
      checkboxes.map((checkbox) => (checkbox as HTMLInputElement).checked));
    if (!executionStates.every(Boolean) || !columnStates.every(Boolean)) {
      throw new Error('Not all column execution and column profiling checkboxes were selected.');
    }

    await this.save('#saveColumns');
  }

  async verifySaved(target: ProfilingTarget, input: ProfilingSettingsInput) {
    await this.reselectTarget(target);
    const row = this.rowByTableId(target.tableId);
    await row.waitFor({ state: 'visible' });
    const executionStatus = (await row.locator('.slick-cell.l16.r16').innerText()).trim();
    if (executionStatus !== input.expectedExecutionStatus) {
      throw new Error(`Unexpected table execution status: ${executionStatus}`);
    }
  }
}
