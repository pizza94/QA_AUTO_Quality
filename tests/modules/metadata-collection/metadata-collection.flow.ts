import type { Page } from '@playwright/test';
import type { LoginEnvironmentReferences } from '../../support/environment';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { MetadataCollectionPage, type MetadataCollectionInput } from './metadata-collection.page';

export async function registerMetadataCollection(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences,
  input: MetadataCollectionInput
) {
  await openQualityManagement(page, loginEnvironment);

  const metadataCollectionPage = new MetadataCollectionPage(page);
  await metadataCollectionPage.open();

  const reservationName = await metadataCollectionPage.nextReservationName(input.reservationNamePrefix);
  await metadataCollectionPage.openNewRegistration();
  await metadataCollectionPage.fillRegistration(reservationName, input);
  await metadataCollectionPage.save();

  return { metadataCollectionPage, reservationName };
}
