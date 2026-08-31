import type { Page } from '@playwright/test';
import type { LoginEnvironmentReferences } from '../../support/environment';
import { openQualityManagement } from '../quality-management/quality-management.flow';
import { MetadataCollectionPage, type MetadataCollectionInput } from './metadata-collection.page';

async function openMetadataCollection(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences
) {
  await openQualityManagement(page, loginEnvironment);

  const metadataCollectionPage = new MetadataCollectionPage(page);
  await metadataCollectionPage.open();
  return metadataCollectionPage;
}

export async function registerMetadataCollection(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences,
  input: MetadataCollectionInput
) {
  const metadataCollectionPage = await openMetadataCollection(page, loginEnvironment);

  const reservationName = await metadataCollectionPage.nextReservationName(input.reservationNamePrefix);
  await metadataCollectionPage.openNewRegistration();
  await metadataCollectionPage.fillRegistration(reservationName, input);
  await metadataCollectionPage.save();

  return { metadataCollectionPage, reservationName };
}

export async function runLatestMetadataCollection(
  page: Page,
  loginEnvironment: LoginEnvironmentReferences,
  reservationNamePrefix: string
) {
  const metadataCollectionPage = await openMetadataCollection(page, loginEnvironment);
  const reservationName = await metadataCollectionPage.latestReservationName(reservationNamePrefix);

  await metadataCollectionPage.selectReservation(reservationName);
  await metadataCollectionPage.openCollectionHistory();
  const historyCountBefore = await metadataCollectionPage.collectionHistoryRows.count();
  await metadataCollectionPage.closeDetails();
  await metadataCollectionPage.runImmediately();

  return { metadataCollectionPage, reservationName, historyCountBefore };
}
