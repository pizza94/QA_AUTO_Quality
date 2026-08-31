import type { Page } from '@playwright/test';

export type VerificationTargetInput = {
  collectionTargetOption: string;
  collectionTargetGridValue: string;
  reflectedYn: string;
  changeType: string;
  database: string;
  owner: string;
  selectionCount: number;
  system: string;
  business: string;
  expectedReflectedYn: string;
};

type Candidate = {
  tableId: string;
  tableName: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class VerificationTargetPage {
  constructor(private readonly page: Page) {}

  get targetManagementMenu() {
    return this.page.locator('a.menu-item').filter({ hasText: '검증대상관리' });
  }

  get verificationTargetLink() {
    return this.page.locator('a[href$="#dataModel"]').filter({ hasText: '검증대상관리' });
  }

  get verificationTargetTab() {
    return this.page.getByRole('tab', { name: '검증대상관리' });
  }

  get additionalFilterButton() {
    return this.page.getByRole('button', { name: '추가필터 표시', exact: true });
  }

  get searchButton() {
    return this.page.locator('#dataModelRegion .search-panel-search-btn');
  }

  get rows() {
    return this.page.locator('#vrfcTrgtMngtGrid .slick-row');
  }

  get reflectButton() {
    return this.page.locator('#inspectionSubjectBundleReflect');
  }

  get registrationDialog() {
    return this.page.getByRole('dialog', { name: '업무 등록' });
  }

  async open() {
    await this.targetManagementMenu.click();
    await this.verificationTargetLink.click();
    await this.verificationTargetTab.waitFor({ state: 'visible' });
  }

  async search(input: VerificationTargetInput) {
    if (await this.additionalFilterButton.isVisible()) {
      await this.additionalFilterButton.click();
    }

    await this.page.locator('#metaCltnTrgt').selectOption({ label: input.collectionTargetOption });
    await this.page.locator('#rflcYn').selectOption({ label: input.reflectedYn });
    await this.page.locator('#statusSelect').selectOption({ label: input.changeType });
    await this.page.locator('#dbNm').fill(input.database);
    await this.page.locator('#usr').fill(input.owner);
    await this.searchButton.click();
    await this.rows.first().waitFor({ state: 'visible' });
  }

  async topCandidates(input: VerificationTargetInput): Promise<Candidate[]> {
    const candidates = await this.rows.evaluateAll((rows, expected) => rows
      .map((row) => {
        const cellText = (index: number) =>
          row.querySelector(`.slick-cell.l${index}.r${index}`)?.textContent?.trim() ?? '';
        return {
          top: Number.parseFloat((row as HTMLElement).style.top || '0'),
          collectionTarget: cellText(2),
          reflectedYn: cellText(3),
          changeType: cellText(5),
          system: cellText(6),
          business: cellText(7),
          database: cellText(8),
          owner: cellText(9),
          tableName: cellText(10),
          tableId: cellText(11)
        };
      })
      .filter((row) =>
        row.collectionTarget === expected.collectionTargetGridValue
        && row.reflectedYn === expected.reflectedYn
        && row.changeType === expected.changeType
        && row.system === ''
        && row.business === ''
        && row.database === expected.database
        && row.owner === expected.owner
      )
      .sort((left, right) => left.top - right.top)
      .slice(0, expected.selectionCount)
      .map(({ tableId, tableName }) => ({ tableId, tableName })), input);

    if (candidates.length !== input.selectionCount) {
      throw new Error(`Expected ${input.selectionCount} verification targets, found ${candidates.length}.`);
    }

    return candidates;
  }

  rowByTableId(tableId: string) {
    const idCell = this.page.locator('.slick-cell.l11.r11').filter({
      hasText: new RegExp(`^${escapeRegExp(tableId)}$`)
    });
    return this.page.locator('#vrfcTrgtMngtGrid .slick-row').filter({ has: idCell });
  }

  async selectCandidates(candidates: Candidate[]) {
    for (const candidate of candidates) {
      const checkbox = this.rowByTableId(candidate.tableId).getByRole('checkbox');
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
      }
    }
  }

  async openRegistration() {
    await this.reflectButton.click();
    await this.registrationDialog.waitFor({ state: 'visible' });
  }

  async register(system: string, business: string) {
    await this.registrationDialog.locator('#multiDataModelDialogUpperBiz').selectOption({ label: system });
    await this.registrationDialog.locator('#multiDataModelDialogBiz').selectOption({ label: business });

    let alertMessage = '';
    this.page.once('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    await this.registrationDialog.getByRole('button', { name: '등록', exact: true }).click();
    await this.registrationDialog.waitFor({ state: 'hidden' });
    return alertMessage;
  }

  async verifyReflected(candidates: Candidate[], input: VerificationTargetInput) {
    await this.page.locator('#rflcYn').selectOption({ label: '전체' });
    await this.searchButton.click();

    for (const candidate of candidates) {
      const row = this.rowByTableId(candidate.tableId);
      await row.waitFor({ state: 'visible' });
      const values = await Promise.all([
        row.locator('.slick-cell.l3.r3').innerText(),
        row.locator('.slick-cell.l6.r6').innerText(),
        row.locator('.slick-cell.l7.r7').innerText()
      ]);
      if (
        values[0].trim() !== input.expectedReflectedYn
        || values[1].trim() !== input.system
        || values[2].trim() !== input.business
      ) {
        throw new Error(`Verification target was not reflected correctly: ${candidate.tableId}`);
      }
    }
  }
}
