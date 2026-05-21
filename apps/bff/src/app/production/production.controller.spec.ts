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

  it('should delegate readHydrogenProductionsByOwner to the service when query arguments are provided', async () => {
    // arrange
    const givenMonth = new Date('2026-05-01T00:00:00.000Z');
    const expectedResult: PaginatedProductionDataDto = PaginatedProductionDataDtoFixture.create();

    productionServiceMock.readHydrogenProductionsByOwner.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.readHydrogenProductionsByOwner(authenticatedUser, 1, 25, 'Unit A', givenMonth);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.readHydrogenProductionsByOwner).toHaveBeenCalledWith(
      authenticatedUser.sub,
      1,
      25,
      'Unit A',
      givenMonth,
    );
  });

  it('should delegate assembleHydrogenProductionsStatisticsByOwner to the service when the authenticated user requests statistics', async () => {
    // arrange
    const givenMonth = new Date('2026-05-01T00:00:00.000Z');
    const expectedResult: ProductionStatisticsDto = ProductionStatisticsDtoFixture.create();

    productionServiceMock.assembleHydrogenProductionStatistics.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.assembleHydrogenProductionsStatisticsByOwner(
      authenticatedUser,
      givenMonth,
      'Unit A',
    );

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.assembleHydrogenProductionStatistics).toHaveBeenCalledWith(
      authenticatedUser.sub,
      'Unit A',
      givenMonth,
    );
  });

  it('should delegate readCsvDocumentsByCompany to the service when the authenticated user requests CSV documents', async () => {
    // arrange
    const expectedResult: ProcessedCsvDto[] = [ProcessedCsvDtoFixture.create()];

    productionServiceMock.readCsvDocumentsByCompany.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.readCsvDocumentsByCompany(authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.readCsvDocumentsByCompany).toHaveBeenCalledWith(authenticatedUser.sub);
  });

  it('should delegate readStagedProductionsByCompanyAndType to the service when filter queries are provided', async () => {
    // arrange
    const givenFrom = new Date('2026-05-01T00:00:00.000Z');
    const givenTo = new Date('2026-05-31T23:59:59.999Z');
    const expectedResult: StagedProductionDto[] = [StagedProductionDtoFixture.create()];

    productionServiceMock.readStagedProductionsByCompanyAndType.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.readStagedProductionsByCompanyAndType(
      StagingScope.OWN,
      CsvContentType.HYDROGEN,
      givenFrom,
      givenTo,
      authenticatedUser,
    );

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.readStagedProductionsByCompanyAndType).toHaveBeenCalledWith(
      authenticatedUser.sub,
      StagingScope.OWN,
      CsvContentType.HYDROGEN,
      givenFrom,
      givenTo,
    );
  });

  it('should delegate verifyCsvDocumentIntegrity to the service when a document id is provided', async () => {
    // arrange
    const expectedResult: CsvDocumentIntegrityResultDto = CsvDocumentIntegrityResultDtoFixture.create({ id: 'document-1' });

    productionServiceMock.verifyCsvDocumentIntegrity.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.verifyCsvDocumentIntegrity(expectedResult.id);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.verifyCsvDocumentIntegrity).toHaveBeenCalledWith(expectedResult.id);
  });

  it('should delegate importCsvFile to the service when files and upload DTO are provided', async () => {
    // arrange
    const givenDto = ProductionCsvUploadDtoFixture.create();
    const givenFiles = [{ originalname: 'production.csv' }] as Express.Multer.File[];
    const expectedResult: AccountingPeriodMatchingResultDto = AccountingPeriodMatchingResultDtoFixture.create();

    productionServiceMock.importCsvFiles.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.importCsvFile(givenDto, givenFiles, authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.importCsvFiles).toHaveBeenCalledWith(givenFiles, givenDto, authenticatedUser.sub);
  });

  it('should delegate createProductionsFromStaging to the service when a staging submission is provided', async () => {
    // arrange
    const givenDto = StagingSubmissionDtoFixture.create();
    const expectedResult: ProductionOverviewDto[] = [ProductionOverviewDtoFixture.create()];

    productionServiceMock.createProductionsFromStaging.mockResolvedValue(expectedResult);

    // act
    const actualResult = await controller.createProductionsFromStaging(givenDto, authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedResult);
    expect(productionServiceMock.createProductionsFromStaging).toHaveBeenCalledWith(givenDto, authenticatedUser.sub);
  });
});