import type { Page } from '@playwright/test';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type JobExecutionInput = {
  jobType: string;
  completedStatus: string;
  completedProgress: string;
  completionTimeoutMs: number;
  uiPollIntervalMs: number;
};

type JobExecutionStatus = {
  startedAt: string;
  endedAt: string;
  jobName: string;
  jobId: string;
  jobStatus: string;
  progress: string;
};

type MonitoringResult = {
  startedAt: string;
  endedAt: string;
  processStatus: string;
  tableId: string;
  columnId: string;
};

export class JobExecutionPage {
  constructor(private readonly page: Page) {}

  get region() {
    return this.page.locator('#exeManageRegion');
  }

  get workManagementMenu() {
    return this.page.locator('a.menu-item#jobMngt');
  }

  get executionLink() {
    return this.page.locator('a[href="/quality_woori/job/jobMain#exeManage"]');
  }

  get executionTab() {
    return this.page.getByRole('tab', { name: '점검작업수행관리' }).filter({ visible: true });
  }

  get searchButton() {
    return this.region.locator('#exeManageSearch').getByRole('button', { name: '검색', exact: true });
  }

  get rows() {
    return this.region.locator('#exeManageGrid .slick-row');
  }

  async open() {
    if (!(await this.executionLink.isVisible())) await this.workManagementMenu.click();
    await this.executionLink.click();
    await this.executionTab.waitFor({ state: 'visible' });
    await this.searchButton.click();
  }

  jobRow(jobName: string) {
    return this.rows.filter({
      has: this.page.locator('.slick-cell.l6.r6').filter({
        hasText: new RegExp(`^${escapeRegExp(jobName)}$`)
      })
    });
  }

  private async waitForSearchResponse(jobName: string) {
    return this.page.waitForResponse((response) => {
      const request = response.request();
      if (!response.ok() || !['xhr', 'fetch'].includes(request.resourceType())) return false;
      const requestText = `${decodeURIComponent(request.url())}\n${request.postData() ?? ''}`;
      return requestText.includes(jobName);
    }, { timeout: 15000 });
  }

  async search(input: JobExecutionInput, jobName: string) {
    await this.region.locator('#jobClassification').selectOption({ label: input.jobType });
    await this.region.locator('input[name="name"]').fill(jobName);
    const response = this.waitForSearchResponse(jobName);
    await this.searchButton.click();
    await response;
    await this.jobRow(jobName).first().waitFor({ state: 'visible' });
  }

  async status(jobName: string): Promise<JobExecutionStatus> {
    const row = this.jobRow(jobName).first();
    const cell = async (index: number) =>
      (await row.locator(`.slick-cell.l${index}.r${index}`).textContent())?.trim() ?? '';
    return {
      startedAt: await cell(2),
      endedAt: await cell(3),
      jobName: await cell(6),
      jobId: await cell(7),
      jobStatus: await cell(9),
      progress: await cell(12)
    };
  }

  async runImmediately(jobName: string) {
    const checkbox = this.jobRow(jobName).first().getByRole('checkbox');
    if (!(await checkbox.isChecked())) await checkbox.click();
    let message = '';
    const acceptDialog = async (dialog: import('@playwright/test').Dialog) => {
      message = dialog.message();
      await dialog.accept();
    };
    this.page.on('dialog', acceptDialog);
    try {
      await this.region.locator('#instantlyExeButton').click();
      await this.page.waitForTimeout(300);
      const confirm = this.page.getByRole('button', { name: '확인', exact: true }).filter({ visible: true });
      if (await confirm.count()) await confirm.last().click();
      return message;
    } finally {
      this.page.off('dialog', acceptDialog);
    }
  }

  async waitForCompletion(input: JobExecutionInput, jobName: string, executionStartedAt: Date) {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const startedAtText = formatter.format(executionStartedAt);
    const deadline = Date.now() + input.completionTimeoutMs;
    let lastStatus: JobExecutionStatus | undefined;

    while (Date.now() < deadline) {
      await this.page.waitForTimeout(input.uiPollIntervalMs);
      await this.search(input, jobName);
      lastStatus = await this.status(jobName);
      if (
        lastStatus.startedAt >= startedAtText
        && lastStatus.endedAt !== ''
        && lastStatus.progress === input.completedProgress
      ) return lastStatus;
    }
    throw new Error(`점검작업이 제한시간 안에 완료되지 않았습니다: ${jobName} ${JSON.stringify(lastStatus)}`);
  }

  async openMonitoring(jobName: string) {
    const checkbox = this.jobRow(jobName).first().getByRole('checkbox');
    if (!(await checkbox.isChecked())) await checkbox.click();
    const opener = this.region.locator('.ui-layout-toggler-south[title="Open"]');
    if (await opener.isVisible()) await opener.click();
    await this.region.getByRole('tab', { name: '모니터링' }).click();
    await this.region.locator('#exeManageMonitoringGrid').waitFor({ state: 'visible' });
  }

  async monitoringResults(): Promise<MonitoringResult[]> {
    return this.region.locator('#exeManageMonitoringGrid .slick-row').evaluateAll((rows) =>
      rows.map((row) => {
        const cell = (index: number) =>
          row.querySelector(`.slick-cell.l${index}.r${index}`)?.textContent?.trim() ?? '';
        return {
          startedAt: cell(1),
          endedAt: cell(2),
          processStatus: cell(4),
          tableId: cell(9),
          columnId: cell(11)
        };
      })
    );
  }
}
