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
  PaginatedProductionDataDto,
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
  PaginatedProcessStepEntity,
  ProductionStagingResultEntity,
  ProductionStatisticsEntity,
  StagedProductionEntity,
  UnitFileImport,
  VerifyCsvDocumentIntegrityResultEntity,
  HydrogenStatisticsEntity,
  PowerStatisticsEntity,
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

  it('readHydrogenProductionsByOwner should resolve the owner and map the paginated response', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const processStep = ProcessStepEntityFixture.createHydrogenProduction({ id: 'production-1' });
    const paginated = new PaginatedProcessStepEntity([processStep], 1, 10, 1);
    const month = new Date('2026-01-01T00:00:00.000Z');

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(paginated));

    const actualResponse: PaginatedProductionDataDto = await service.readHydrogenProductionsByOwner(
      userId,
      1,
      10,
      'Unit A',
      month,
    );

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_PAGINATION_BY_PREDECESSOR_TYPES_AND_OWNER,
      new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.POWER_PRODUCTION],
        userDetails.company.id,
        new ProductionDataFilter(1, 10, 'Unit A', month),
      ),
    );
    expect(actualResponse).toEqual(PaginatedProductionDataDto.fromEntity(paginated));
  });

  it('readHydrogenProductionsByOwner should reject when the user company lookup fails', async () => {
    userServiceMock.readUserWithCompany.mockRejectedValue(new Error('user lookup failed'));

    await expect(service.readHydrogenProductionsByOwner('user-id-1', 1, 10)).rejects.toThrow('user lookup failed');

    expect(processSvcMock.send).not.toHaveBeenCalled();
  });

  it('readStagedProductionsByCompanyAndType should request staged productions for the resolved owner', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-01-31T23:59:59.999Z');
    const stagedProductions = [
      new StagedProductionEntity(
        'staged-1',
        new Date('2026-01-05T08:00:00.000Z'),
        new Date('2026-01-05T09:00:00.000Z'),
        10,
        'unit-1',
        userDetails.company.id,
        5,
        CsvContentType.HYDROGEN,
      ),
    ];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(stagedProductions));

    const actualResponse: StagedProductionDto[] = await service.readStagedProductionsByCompanyAndType(
      userId,
      StagingScope.OWN,
      CsvContentType.HYDROGEN,
      from,
      to,
    );

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.READ_STAGED_PRODUCTION_BY_COMPANY,
      new ReadStagedProductionsPayload(userDetails.company.id, StagingScope.OWN, CsvContentType.HYDROGEN, from, to),
    );
    expect(actualResponse).toEqual(stagedProductions.map(StagedProductionDto.fromEntity));
  });

  it('assembleHydrogenProductionStatistics should request statistics for the resolved owner', async () => {
    const userId = 'user-id-1';
    const month = new Date('2026-01-01T00:00:00.000Z');
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const statistics = new ProductionStatisticsEntity(
      new HydrogenStatisticsEntity(5, 10),
      new PowerStatisticsEntity(15, 3, 2),
    );

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(statistics));

    const actualResponse: ProductionStatisticsDto = await service.assembleHydrogenProductionStatistics(
      userId,
      'Unit A',
      month,
    );

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.ASSEMBLE_PRODUCTION_STATISTICS,
      new CreateHydrogenProductionStatisticsPayload(userDetails.company.id, month, 'Unit A'),
    );
    expect(actualResponse).toEqual(ProductionStatisticsDto.fromEntity(statistics));
  });

  it('importCsvFiles should hash, encode and stage each file for the resolved owner', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const dto = ProductionCsvUploadDtoFixture.create({ unitIds: ['unit-1', 'unit-2'], csvContentType: CsvContentType.HYDROGEN });
    const firstFile = createFile('first.csv', 'first');
    const secondFile = createFile('second.csv', 'second');
    const stagedProductions = [
      new StagedProductionEntity(
        'staged-1',
        new Date('2026-01-05T08:00:00.000Z'),
        new Date('2026-01-05T09:00:00.000Z'),
        10,
        'unit-1',
        userDetails.company.id,
        5,
        CsvContentType.HYDROGEN,
      ),
    ];
    const matchingResult = new ProductionStagingResultEntity('staging-1', stagedProductions);

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    jest.mocked(hashBuffer).mockReturnValueOnce('hash-1').mockReturnValueOnce('hash-2');
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(matchingResult));

    const actualResponse: AccountingPeriodMatchingResultDto = await service.importCsvFiles(
      [firstFile, secondFile],
      dto,
      userId,
    );

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.STAGE,
      new StageProductionsPayload(
        [
          new UnitFileImport('unit-1', 'hash-1', firstFile.buffer.toString('base64'), dto.csvContentType),
          new UnitFileImport('unit-2', 'hash-2', secondFile.buffer.toString('base64'), dto.csvContentType),
        ],
        userId,
        userDetails.company.id,
        dto.timeZone,
      ),
    );
    expect(actualResponse).toEqual(AccountingPeriodMatchingResultDto.fromEntity(matchingResult));
  });

  it('importCsvFiles should throw when no files are provided', async () => {
    const dto = ProductionCsvUploadDtoFixture.create({ unitIds: ['unit-1'], csvContentType: CsvContentType.HYDROGEN });

    await expect(service.importCsvFiles([], dto, 'user-id-1')).rejects.toThrow('Missing file for HYDROGEN production.');
  });

  it('importCsvFiles should throw when the unit id count does not match the file count', async () => {
    const dto = ProductionCsvUploadDtoFixture.create({ unitIds: [], csvContentType: CsvContentType.HYDROGEN });
    const file = createFile('first.csv', 'first');

    await expect(service.importCsvFiles([file], dto, 'user-id-1')).rejects.toThrow(
      'Unit IDs count must match file count for HYDROGEN production: expected 1, got 0.',
    );
  });

  it('importCsvFiles should throw when the csv type is invalid', async () => {
    const dto = ProductionCsvUploadDtoFixture.create({
      unitIds: ['unit-1'],
      csvContentType: 'INVALID' as CsvContentType,
    });
    const file = createFile('first.csv', 'first');

    await expect(service.importCsvFiles([file], dto, 'user-id-1')).rejects.toThrow(
      'Stage production contains invalid types.',
    );
  });

  it('createProductionsFromStaging should finalize the staged ids and map the response', async () => {
    const userId = 'user-id-1';
    const dto = StagingSubmissionDtoFixture.create();
    const processSteps = [ProcessStepEntityFixture.createHydrogenProduction({ id: 'production-1' })];

    processSvcMock.send.mockImplementation((_pattern, _payload) => of(processSteps));

    const actualResponse = await service.createProductionsFromStaging(dto, userId);

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.FINALIZE,
      new FinalizeProductionsPayload(
        userId,
        dto.stagedHydrogenProduction,
        dto.stagedPowerProductions,
        dto.storageUnitId,
      ),
    );
    expect(actualResponse).toEqual(processSteps.map(ProductionOverviewDto.fromEntity));
  });

  it('readCsvDocumentsByCompany should map each csv document including its storage url', async () => {
    const userId = 'user-id-1';
    const userDetails: UserDetailsDto = UserDetailsDtoFixture.create({ company: { id: 'company-id-1', name: 'Company' } });
    const csvDocuments = [CsvDocumentEntityFixture.create({ id: 'document-1', fileName: 'document-1.csv', type: CsvContentType.HYDROGEN })];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(csvDocuments));

    const actualResponse: ProcessedCsvDto[] = await service.readCsvDocumentsByCompany(userId);

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.READ_CSV_DOCUMENTS_BY_COMPANY,
      new ReadByIdPayload(userDetails.company.id),
    );
    expect(actualResponse).toEqual(
      csvDocuments.map((document) => ProcessedCsvDto.fromEntity(document, storageServiceMock.endpointUrl, userDetails.company.name)),
    );
  });

  it('verifyCsvDocumentIntegrity should request the verification result by document id and map the response', async () => {
    const documentId = 'document-1';
    const verificationResult = new VerifyCsvDocumentIntegrityResultEntity(
      documentId,
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

    processSvcMock.send.mockImplementation((_pattern, _payload) => of(verificationResult));

    const actualResponse: CsvDocumentIntegrityResultDto = await service.verifyCsvDocumentIntegrity(documentId);

    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY,
      new ReadByIdPayload(documentId),
    );
    expect(actualResponse).toEqual(CsvDocumentIntegrityResultDto.fromEntity(verificationResult));
  });

  it('verifyCsvDocumentIntegrity should propagate process service errors', async () => {
    processSvcMock.send.mockImplementation((_pattern, _payload) => throwError(() => new Error('verification failed')));

    await expect(service.verifyCsvDocumentIntegrity('document-1')).rejects.toThrow('verification failed');
  });
});