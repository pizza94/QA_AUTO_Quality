import type { Page } from '@playwright/test';
import { SmokePage } from './smoke.page';

export async function openService(page: Page) {
  const smokePage = new SmokePage(page);
  const response = await smokePage.open();

  return { response, smokePage };
}
