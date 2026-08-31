import type { Page } from '@playwright/test';
import type {
  ProfilingColumnTarget,
  ProfilingTarget
} from '../profiling-settings/profiling-settings.page';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type ColumnAnalysisInput = {
  system: string;
  business: string;
  executionHistory: string;
  collectionTarget: string;
  database: string;
  owner: string;
  exactTableSearchOption: string;
};

export type MappingRuleInput = {
  executionHistory: string;
  fallbackRule: string;
};

type ColumnAnalysisResult = ProfilingColumnTarget & {
  executedAt: string;
  jobStatus: string;
  brConversionStatus: string;
  collectionTarget: string;
  system: string;
  business: string;
  database: string;
  owner: string;
  tableName: string;
  tableId: string;
  dataType: string;
};

export class ColumnAnalysisPage {
  constructor(private readonly page: Page) {}

  get region() {
    return this.page.locator('#columnAnalysisRegion');
  }

  get profilingMenu() {
    return this.page.locator('a.menu-item#profl');
  }

  get columnAnalysisLink() {
    return this.page.getByRole('link', { name: '컬럼분석', exact: true });
  }

  get columnAnalysisTab() {
    return this.page.getByRole('tab', { name: '컬럼분석' }).filter({ visible: true });
  }

  get searchButton() {
    return this.region.getByRole('button', { name: '검색', exact: true });
  }

  get rows() {
    return this.region.locator('#columnAnalysisColumnsGrid .slick-row');
  }

  get executeButton() {
    return this.region.locator('#columnAnalysisExeButton');
  }

  async open() {
    if (!(await this.columnAnalysisLink.isVisible())) {
      await this.profilingMenu.click();
    }
    await this.columnAnalysisLink.click();
    await this.columnAnalysisTab.waitFor({ state: 'visible' });
    await this.searchButton.click();
  }

  async search(input: ColumnAnalysisInput, target: ProfilingTarget) {
    await this.region.locator('select[name="table.sys"]').selectOption({ label: input.system });
    await this.region.locator('select[name="table.biz"]').selectOption({ label: input.business });
    await this.region.locator('input[name="table.tableName"]').fill(target.tableId);
    await this.region.locator('select[name="table.tableSearchOption"]').selectOption({
      label: input.exactTableSearchOption
    });

    const additionalFilterButton = this.region.getByRole('button', {
      name: '추가필터 표시', exact: true
    });
    if (await additionalFilterButton.isVisible()) {
      await additionalFilterButton.click();
    }

    await this.region.locator('#historyExec').selectOption({ label: input.executionHistory });
    await this.region.locator('input[name="table.dbName"]').fill(input.database);
    await this.region.locator('input[name="table.owner"]').fill(input.owner);
    await this.searchButton.click();
    await this.region.locator('#columnAnalysisColumnsGrid .slick-cell.l11.r11').filter({
      hasText: new RegExp(`^${escapeRegExp(target.tableId)}$`)
    }).first().waitFor({ state: 'visible' });
  }

  async results(): Promise<ColumnAnalysisResult[]> {
    return this.rows.evaluateAll((rows) => rows.map((row) => {
      const cell = (index: number) =>
        row.querySelector(`.slick-cell.l${index}.r${index}`)?.textContent?.trim() ?? '';
      return {
        executedAt: cell(2),
        jobStatus: cell(3),
        brConversionStatus: cell(4),
        collectionTarget: cell(5),
        system: cell(6),
        business: cell(7),
        database: cell(8),
        owner: cell(9),
        tableName: cell(10),
        tableId: cell(11),
        columnName: cell(12),
        columnId: cell(13),
        dataType: cell(18)
      };
    }));
  }

  private async scrollToHeader(name: string) {
    const viewport = this.region.locator(
      '#columnAnalysisColumnsGrid .slick-viewport-top.slick-viewport-left'
    );
    const header = this.region.locator('#columnAnalysisColumnsGrid .slick-header-column').filter({
      hasText: new RegExp(`^${escapeRegExp(name)}$`)
    });
    const left = await header.evaluate((node) => (node as HTMLElement).offsetLeft);
    await viewport.evaluate((node, targetLeft) => {
      node.scrollLeft = Math.max(0, targetLeft - 300);
      node.dispatchEvent(new Event('scroll'));
    }, left);
  }

  mappingRuleFor(column: ColumnAnalysisResult, fallbackRule: string) {
    const name = column.columnName.replace(/\s/g, '');
    if (/휴대폰/.test(name)) return '휴대폰번호+구분자(설정)';
    if (/전화/.test(name)) return '전화번호+구분자(설정)';
    if (/우편/.test(name)) return '우편번호';
    if (/여부|유무|YN$/i.test(name)) return '여부(Y/N)';
    if (/금액|금원|가격/.test(name)) return '금액';
    if (/수량|건수/.test(name)) return '수량';
    if (/코드/.test(name)) return '영문+숫자';
    if (/번호|순번|차수/.test(name) && /NUMBER|INT|DECIMAL|NUMERIC/i.test(column.dataType)) {
      return '숫자완성';
    }
    if (/명$|이름|성명/.test(name)) return '한글완성';
    return fallbackRule;
  }

  async applyMappingRules(
    targetResults: ColumnAnalysisResult[],
    columnIds: string[],
    fallbackRule: string
  ) {
    const selectedRows = targetResults
      .map((result, rowIndex) => ({ result, rowIndex }))
      .filter(({ result }) => columnIds.includes(result.columnId));
    await this.scrollToHeader('매핑룰');

    const applied: Array<{ columnId: string; rule: string; message: string }> = [];
    for (const { result, rowIndex } of selectedRows) {
      const rule = this.mappingRuleFor(result, fallbackRule);
      const select = this.rows.nth(rowIndex).locator('select[name="column.mappingRuleObjectId"]');
      await select.waitFor({ state: 'visible' });
      let message = '';
      const acceptDialog = async (dialog: import('@playwright/test').Dialog) => {
        message = dialog.message();
        await dialog.accept();
      };
      this.page.once('dialog', acceptDialog);
      await select.selectOption({ label: rule });
      await this.page.waitForTimeout(300);
      applied.push({ columnId: result.columnId, rule, message });
    }
    return applied;
  }

  rowByColumnId(columnId: string) {
    const idCell = this.page.locator('.slick-cell.l13.r13').filter({
      hasText: new RegExp(`^${escapeRegExp(columnId)}$`)
    });
    return this.rows.filter({ has: idCell });
  }

  async selectColumns(columnIds: string[]) {
    for (const columnId of columnIds) {
      const checkbox = this.rowByColumnId(columnId).getByRole('checkbox');
      await checkbox.waitFor({ state: 'visible' });
      if (!(await checkbox.isChecked())) await checkbox.click();
    }
  }

  async runSelectedColumns() {
    let dialogMessage = '';
    const acceptDialog = async (dialog: import('@playwright/test').Dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    };
    this.page.on('dialog', acceptDialog);
    try {
      await this.executeButton.click();
      await this.page.waitForTimeout(500);
      const confirmButton = this.page.getByRole('button', { name: '확인', exact: true }).filter({
        visible: true
      });
      if (await confirmButton.count()) await confirmButton.last().click();
      return dialogMessage;
    } finally {
      this.page.off('dialog', acceptDialog);
    }
  }
}
