/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { hashBuffer } from '@h2-trust/blockchain';
import {
  AccountingPeriodMatchingResultDto,
  CsvDocumentIntegrityResultDto,
  PaginatedDataDto,
  ProcessedCsvDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  StagedProductionDto,
  type UserDetailsDto,
} from '@h2-trust/contracts/dtos';
import {
  ProductionCsvUploadDtoFixture,
  StagingSubmissionDtoFixture,
  UserDetailsDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import {
  HydrogenStatisticsEntity,
  PaginatedProcessStepEntity,
  PowerStatisticsEntity,
  ProductionStagingResultEntity,
  ProductionStatisticsEntity,
  StagedProductionEntity,
  UnitFileImport,
  VerifyCsvDocumentIntegrityResultEntity,
} from '@h2-trust/contracts/entities';
import { CsvDocumentEntityFixture, ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenProductionStatisticsPayload,
  FinalizeProductionsPayload,
  ProductionDataFilter,
  ReadByIdPayload,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadStagedProductionsPayload,
  StageProductionsPayload,
} from '@h2-trust/contracts/payloads';
import { CsvContentType, CsvDocumentIntegrityStatus, ProcessType, StagingScope } from '@h2-trust/domain';
import { ProcessStepMessagePatterns, ProductionMessagePatterns } from '@h2-trust/messaging';
import { CentralizedStorageService } from '@h2-trust/storage';
import { UserService } from '../user/user.service';
import { ProductionService } from './production.service';

jest.mock('@h2-trust/blockchain', () => ({
  hashBuffer: jest.fn(),
}));

describe('ProductionService', () => {
  let service: ProductionService;

  const processSvcMock = {
    send: jest.fn(),
  };

  const storageServiceMock = {
    endpointUrl: 'http://storage.local',
  };

  const userServiceMock = {
    readUserWithCompany: jest.fn(),
  };

  const createFile = (name: string, content: string): Express.Multer.File => ({
    fieldname: 'files',
    originalname: name,
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: Buffer.from(content, 'utf-8'),
    size: Buffer.byteLength(content),
    destination: '',
    filename: name,
    path: '',
    stream: null as never,
  });

  beforeEach(() => {
    service = new ProductionService(
      processSvcMock as unknown as ClientProxy,
      storageServiceMock as unknown as CentralizedStorageService,
      userServiceMock as unknown as UserService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve the owner and map the paginated response when reading hydrogen productions by owner', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({
      company: { id: 'company-id-1', name: 'Company' },
    });
    const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction({ id: 'production-1' });
    const expectedPaginated = new PaginatedProcessStepEntity([givenProcessStep], 1, 10, 1);
    const givenMonth = new Date('2026-01-01T00:00:00.000Z');

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedPaginated));

    // act
    const actualResult: PaginatedDataDto<ProductionOverviewDto> = await service.readHydrogenProductionsByOwner(
      givenUserId,
      1,
      10,
      'Unit A',
      givenMonth,
    );

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_PAGINATION_BY_PREDECESSOR_TYPES_AND_OWNER,
      new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.POWER_PRODUCTION],
        givenUserDetails.company.id,
        new ProductionDataFilter(1, 10, 'Unit A', givenMonth),
      ),
    );
    expect(actualResult).toEqual(
      PaginatedDataDto.fromEntity<ProductionOverviewDto>(
        expectedPaginated.processSteps.map(ProductionOverviewDto.fromEntity),
        expectedPaginated.totalAmountOfItems,
        expectedPaginated.currentPage,
      ),
    );
  });

  it('should reject when the user company lookup fails while reading hydrogen productions by owner', async () => {
    // arrange
    userServiceMock.readUserWithCompany.mockRejectedValue(new Error('user lookup failed'));

    // act
    const actualResult = service.readHydrogenProductionsByOwner('user-id-1', 1, 10);

    // assert
    await expect(actualResult).rejects.toThrow('user lookup failed');
    expect(processSvcMock.send).not.toHaveBeenCalled();
  });

  it('should request staged productions for the resolved owner when reading staged productions by company and type', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({
      company: { id: 'company-id-1', name: 'Company' },
    });
    const givenFrom = new Date('2026-01-01T00:00:00.000Z');
    const givenTo = new Date('2026-01-31T23:59:59.999Z');
    const expectedStagedProductions = [
      new StagedProductionEntity(
        'staged-1',
        new Date('2026-01-05T08:00:00.000Z'),
        new Date('2026-01-05T09:00:00.000Z'),
        10,
        'unit-1',
        givenUserDetails.company.id,
        5,
        CsvContentType.HYDROGEN,
      ),
    ];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedStagedProductions));

    // act
    const actualResult: StagedProductionDto[] = await service.readStagedProductionsByCompanyAndType(
      givenUserId,
      StagingScope.OWN,
      CsvContentType.HYDROGEN,
      givenFrom,
      givenTo,
    );

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.READ_STAGED_PRODUCTION_BY_COMPANY,
      new ReadStagedProductionsPayload(
        givenUserDetails.company.id,
        StagingScope.OWN,
        CsvContentType.HYDROGEN,
        givenFrom,
        givenTo,
      ),
    );
    expect(actualResult).toEqual(expectedStagedProductions.map(StagedProductionDto.fromEntity));
  });

  it('should request statistics for the resolved owner when assembling hydrogen production statistics', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenMonth = new Date('2026-01-01T00:00:00.000Z');
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({
      company: { id: 'company-id-1', name: 'Company' },
    });
    const expectedStatistics = new ProductionStatisticsEntity(
      new HydrogenStatisticsEntity(5, 10),
      new PowerStatisticsEntity(15, 3, 2),
    );

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedStatistics));

    // act
    const actualResult: ProductionStatisticsDto = await service.assembleHydrogenProductionStatistics(
      givenUserId,
      'Unit A',
      givenMonth,
    );

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.ASSEMBLE_PRODUCTION_STATISTICS,
      new CreateHydrogenProductionStatisticsPayload(givenUserDetails.company.id, givenMonth, 'Unit A'),
    );
    expect(actualResult).toEqual(ProductionStatisticsDto.fromEntity(expectedStatistics));
  });

  it('should hash, encode, and stage each file for the resolved owner when importing CSV files', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({
      company: { id: 'company-id-1', name: 'Company' },
    });
    const givenDto = ProductionCsvUploadDtoFixture.create({
      unitIds: ['unit-1', 'unit-2'],
      csvContentType: CsvContentType.HYDROGEN,
    });
    const givenFirstFile = createFile('first.csv', 'first');
    const givenSecondFile = createFile('second.csv', 'second');
    const givenStagedProductions = [
      new StagedProductionEntity(
        'staged-1',
        new Date('2026-01-05T08:00:00.000Z'),
        new Date('2026-01-05T09:00:00.000Z'),
        10,
        'unit-1',
        givenUserDetails.company.id,
        5,
        CsvContentType.HYDROGEN,
      ),
    ];
    const expectedMatchingResult = new ProductionStagingResultEntity('staging-1', givenStagedProductions);

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    jest.mocked(hashBuffer).mockReturnValueOnce('hash-1').mockReturnValueOnce('hash-2');
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedMatchingResult));

    // act
    const actualResult: AccountingPeriodMatchingResultDto = await service.importCsvFiles(
      [givenFirstFile, givenSecondFile],
      givenDto,
      givenUserId,
    );

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.STAGE,
      new StageProductionsPayload(
        [
          new UnitFileImport('unit-1', 'hash-1', givenFirstFile.buffer.toString('base64'), givenDto.csvContentType),
          new UnitFileImport('unit-2', 'hash-2', givenSecondFile.buffer.toString('base64'), givenDto.csvContentType),
        ],
        givenUserId,
        givenUserDetails.company.id,
        givenDto.timeZone,
      ),
    );
    expect(actualResult).toEqual(AccountingPeriodMatchingResultDto.fromEntity(expectedMatchingResult));
  });

  it('should throw when no files are provided while importing CSV files', async () => {
    // arrange
    const givenDto = ProductionCsvUploadDtoFixture.create({
      unitIds: ['unit-1'],
      csvContentType: CsvContentType.HYDROGEN,
    });

    // act
    const actualResult = service.importCsvFiles([], givenDto, 'user-id-1');

    // assert
    await expect(actualResult).rejects.toThrow('Missing file for HYDROGEN production.');
  });

  it('should throw when the unit id count does not match the file count while importing CSV files', async () => {
    // arrange
    const givenDto = ProductionCsvUploadDtoFixture.create({ unitIds: [], csvContentType: CsvContentType.HYDROGEN });
    const givenFile = createFile('first.csv', 'first');

    // act
    const actualResult = service.importCsvFiles([givenFile], givenDto, 'user-id-1');

    // assert
    await expect(actualResult).rejects.toThrow(
      'Unit IDs count must match file count for HYDROGEN production: expected 1, got 0.',
    );
  });

  it('should throw when the CSV type is invalid while importing CSV files', async () => {
    // arrange
    const givenDto = ProductionCsvUploadDtoFixture.create({
      unitIds: ['unit-1'],
      csvContentType: 'INVALID' as CsvContentType,
    });
    const givenFile = createFile('first.csv', 'first');

    // act
    const actualResult = service.importCsvFiles([givenFile], givenDto, 'user-id-1');

    // assert
    await expect(actualResult).rejects.toThrow('Stage production contains invalid types.');
  });

  it('should finalize the staged ids and map the response when creating productions from staging', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenDto = StagingSubmissionDtoFixture.create();
    const expectedProcessSteps = [ProcessStepEntityFixture.createHydrogenProduction({ id: 'production-1' })];

    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedProcessSteps));

    // act
    const actualResult = await service.createProductionsFromStaging(givenDto, givenUserId);

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.FINALIZE,
      new FinalizeProductionsPayload(
        givenUserId,
        givenDto.stagedHydrogenProduction,
        givenDto.stagedPowerProductions,
        givenDto.storageUnitId,
      ),
    );
    expect(actualResult).toEqual(expectedProcessSteps.map(ProductionOverviewDto.fromEntity));
  });

  it('should map each CSV document including its storage URL when reading CSV documents by company', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails: UserDetailsDto = UserDetailsDtoFixture.create({
      company: { id: 'company-id-1', name: 'Company' },
    });
    const expectedCsvDocuments = [
      CsvDocumentEntityFixture.create({ id: 'document-1', fileName: 'document-1.csv', type: CsvContentType.HYDROGEN }),
    ];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedCsvDocuments));

    // act
    const actualResult: ProcessedCsvDto[] = await service.readCsvDocumentsByCompany(givenUserId);

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.READ_CSV_DOCUMENTS_BY_COMPANY,
      new ReadByIdPayload(givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(
      expectedCsvDocuments.map((givenDocument) =>
        ProcessedCsvDto.fromEntity(givenDocument, storageServiceMock.endpointUrl, givenUserDetails.company.name),
      ),
    );
  });

  it('should request the verification result by document id and map the response when verifying CSV document integrity', async () => {
    // arrange
    const givenDocumentId = 'document-1';
    const expectedVerificationResult = new VerifyCsvDocumentIntegrityResultEntity(
      givenDocumentId,
      'file.csv',
      CsvDocumentIntegrityStatus.VERIFIED,
      'File integrity verified successfully.',
      '0xhash',
      123,
      new Date('2026-02-18T10:26:29.000Z'),
      'Arbitrum Sepolia',
      '0xcontract',
      'https://sepolia.arbiscan.io/tx/0xhash',
      'some-cid',
      'https://ipfs.io/ipfs/some-cid',
    );

    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedVerificationResult));

    // act
    const actualResult: CsvDocumentIntegrityResultDto = await service.verifyCsvDocumentIntegrity(givenDocumentId);

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY,
      new ReadByIdPayload(givenDocumentId),
    );
    expect(actualResult).toEqual(CsvDocumentIntegrityResultDto.fromEntity(expectedVerificationResult));
  });

  it('should propagate process service errors when verifying CSV document integrity', async () => {
    // arrange
    processSvcMock.send.mockImplementation((_pattern, _payload) => throwError(() => new Error('verification failed')));

    // act
    const actualResult = service.verifyCsvDocumentIntegrity('document-1');

    // assert
    await expect(actualResult).rejects.toThrow('verification failed');
  });
});
