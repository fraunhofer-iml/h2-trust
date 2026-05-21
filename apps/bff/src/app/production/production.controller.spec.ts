/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type AccountingPeriodMatchingResultDto,
  type AuthenticatedKCUser,
  type CsvDocumentIntegrityResultDto,
  type PaginatedProductionDataDto,
  type ProcessedCsvDto,
  type ProductionOverviewDto,
  type ProductionStatisticsDto,
  type StagedProductionDto,
} from '@h2-trust/contracts/dtos';
import {
  AccountingPeriodMatchingResultDtoFixture,
  CsvDocumentIntegrityResultDtoFixture,
  PaginatedProductionDataDtoFixture,
  ProcessedCsvDtoFixture,
  ProductionCsvUploadDtoFixture,
  ProductionOverviewDtoFixture,
  ProductionStatisticsDtoFixture,
  StagedProductionDtoFixture,
  StagingSubmissionDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { CsvContentType, StagingScope } from '@h2-trust/domain';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  let controller: ProductionController;

  const productionServiceMock = {
    readHydrogenProductionsByOwner: jest.fn(),
    assembleHydrogenProductionStatistics: jest.fn(),
    readCsvDocumentsByCompany: jest.fn(),
    readStagedProductionsByCompanyAndType: jest.fn(),
    verifyCsvDocumentIntegrity: jest.fn(),
    importCsvFiles: jest.fn(),
    createProductionsFromStaging: jest.fn(),
  };

  const authenticatedUser = { sub: 'user-id-1' } as AuthenticatedKCUser;

  beforeEach(() => {
    controller = new ProductionController(productionServiceMock as unknown as ProductionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates readHydrogenProductionsByOwner with the authenticated user and query arguments', async () => {
    const month = new Date('2026-05-01T00:00:00.000Z');
    const result: PaginatedProductionDataDto = PaginatedProductionDataDtoFixture.create();

    productionServiceMock.readHydrogenProductionsByOwner.mockResolvedValue(result);

    await expect(controller.readHydrogenProductionsByOwner(authenticatedUser, 1, 25, 'Unit A', month)).resolves.toEqual(
      result,
    );
    expect(productionServiceMock.readHydrogenProductionsByOwner).toHaveBeenCalledWith(
      authenticatedUser.sub,
      1,
      25,
      'Unit A',
      month,
    );
  });

  it('delegates assembleHydrogenProductionsStatisticsByOwner with the authenticated user id', async () => {
    const month = new Date('2026-05-01T00:00:00.000Z');
    const result: ProductionStatisticsDto = ProductionStatisticsDtoFixture.create();

    productionServiceMock.assembleHydrogenProductionStatistics.mockResolvedValue(result);

    await expect(
      controller.assembleHydrogenProductionsStatisticsByOwner(authenticatedUser, month, 'Unit A'),
    ).resolves.toEqual(result);
    expect(productionServiceMock.assembleHydrogenProductionStatistics).toHaveBeenCalledWith(
      authenticatedUser.sub,
      'Unit A',
      month,
    );
  });

  it('delegates readCsvDocumentsByCompany with the authenticated user id', async () => {
    const result: ProcessedCsvDto[] = [ProcessedCsvDtoFixture.create()];

    productionServiceMock.readCsvDocumentsByCompany.mockResolvedValue(result);

    await expect(controller.readCsvDocumentsByCompany(authenticatedUser)).resolves.toEqual(result);
    expect(productionServiceMock.readCsvDocumentsByCompany).toHaveBeenCalledWith(authenticatedUser.sub);
  });

  it('delegates readStagedProductionsByCompanyAndType with filter queries and the authenticated user id', async () => {
    const from = new Date('2026-05-01T00:00:00.000Z');
    const to = new Date('2026-05-31T23:59:59.999Z');
    const result: StagedProductionDto[] = [StagedProductionDtoFixture.create()];

    productionServiceMock.readStagedProductionsByCompanyAndType.mockResolvedValue(result);

    await expect(
      controller.readStagedProductionsByCompanyAndType(
        StagingScope.OWN,
        CsvContentType.HYDROGEN,
        from,
        to,
        authenticatedUser,
      ),
    ).resolves.toEqual(result);
    expect(productionServiceMock.readStagedProductionsByCompanyAndType).toHaveBeenCalledWith(
      authenticatedUser.sub,
      StagingScope.OWN,
      CsvContentType.HYDROGEN,
      from,
      to,
    );
  });

  it('delegates verifyCsvDocumentIntegrity by document id', async () => {
    const result: CsvDocumentIntegrityResultDto = CsvDocumentIntegrityResultDtoFixture.create({ id: 'document-1' });

    productionServiceMock.verifyCsvDocumentIntegrity.mockResolvedValue(result);

    await expect(controller.verifyCsvDocumentIntegrity(result.id)).resolves.toEqual(result);
    expect(productionServiceMock.verifyCsvDocumentIntegrity).toHaveBeenCalledWith(result.id);
  });

  it('delegates importCsvFile with files, dto and authenticated user id', async () => {
    const dto = ProductionCsvUploadDtoFixture.create();
    const files = [{ originalname: 'production.csv' }] as Express.Multer.File[];
    const result: AccountingPeriodMatchingResultDto = AccountingPeriodMatchingResultDtoFixture.create();

    productionServiceMock.importCsvFiles.mockResolvedValue(result);

    await expect(controller.importCsvFile(dto, files, authenticatedUser)).resolves.toEqual(result);
    expect(productionServiceMock.importCsvFiles).toHaveBeenCalledWith(files, dto, authenticatedUser.sub);
  });

  it('delegates createProductionsFromStaging with the submission dto and authenticated user id', async () => {
    const dto = StagingSubmissionDtoFixture.create();
    const result: ProductionOverviewDto[] = [ProductionOverviewDtoFixture.create()];

    productionServiceMock.createProductionsFromStaging.mockResolvedValue(result);

    await expect(controller.createProductionsFromStaging(dto, authenticatedUser)).resolves.toEqual(result);
    expect(productionServiceMock.createProductionsFromStaging).toHaveBeenCalledWith(dto, authenticatedUser.sub);
  });
});