/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  PaginatedProcessStepEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  VerifyCsvDocumentIntegrityResultEntity,
} from '@h2-trust/amqp';
import {
  AccountingPeriodMatchingResultDto,
  AuthenticatedKCUser,
  CreateProductionDtoMock,
  CsvDocumentIntegrityResultDto,
  PaginatedProductionDataDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import { CsvContentType, CsvDocumentIntegrityStatus, ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, HydrogenProductionUnitEntityFixture, UserEntityFixture } from '@h2-trust/fixtures';
import { CentralizedStorageService } from '@h2-trust/storage';
import 'multer';
import { of } from 'rxjs';
import { UserService } from '../user/user.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  let controller: ProductionController;
  let generalSvc: ClientProxy;
  let processSvc: ClientProxy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        ProductionService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: CentralizedStorageService,
          useValue: {
            uploadFileWithRandomFileName: jest.fn().mockResolvedValue('random-file-name.csv'),
          },
        },
        {
          provide: UserService,
          useValue: {
            readUserWithCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
    processSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_PROCESS_SVC) as ClientProxy;
    userService = module.get<UserService>(UserService);
  });

  it('should read hydrogen productions', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };
    const processStepEntityMocks: ProcessStepEntity[] = [
      {
        id: 'hydrogen-production-process-step-1',
        startedAt: new Date(CreateProductionDtoMock.productionStartedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        type: ProcessType.HYDROGEN_PRODUCTION,
        batch: BatchEntityFixture.createHydrogenBatch(),
        recordedBy: UserEntityFixture.createHydrogenUser(),
        executedBy: HydrogenProductionUnitEntityFixture.create(),
      },
    ];
    const paginatedProductionDataDtoMock: PaginatedProductionDataDto = {
      data: processStepEntityMocks.map(ProductionOverviewDto.fromEntity),
      totalItems: 1,
      currentPage: 1,
    };
    const paginatedProcessStepEntityMock: PaginatedProcessStepEntity = {
      processSteps: processStepEntityMocks,
      totalAmountOfItems: 1,
      currentPage: 1,
      pageSize: 1,
    };

    const expectedResponse: PaginatedProductionDataDto = paginatedProductionDataDtoMock;

    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(UserDetailsDtoMock[0]);

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of(paginatedProcessStepEntityMock),
      );

    const actualResponse: PaginatedProductionDataDto = await controller.readHydrogenProductionsByOwner(
      givenAuthenticatedUser,
      1,
      1,
      processStepEntityMocks[0].executedBy.name,
      CreateProductionDtoMock.productionStartedAt,
    );

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw because files are missing ', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };

    const dto: ProductionCSVUploadDto = { unitIds: [], csvContentType: CsvContentType.HYDROGEN };

    expect(() => controller.importCsvFile(dto, [], givenAuthenticatedUser)).toThrow(NotImplementedException);
  });

  it('should parse csv', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };

    const expectedResponse: AccountingPeriodMatchingResultDto = {
      hydrogenProduced: 20,
      id: 'id',
      numberOfBatches: 1,
      powerUsed: 2,
    };

    const powerContent = 'time,amount\n2025-11-27T09:00:00Z,2\n2025-11-27T09:00:00Z,2';

    const powerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'powerFile.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: Buffer.from(powerContent, 'utf-8'),
      size: Buffer.byteLength(powerContent),
      destination: '',
      filename: 'powerFile',
      path: '',
      stream: null as any,
    };

    const h2Content = 'time,amount,power\n2025-11-27T09:00:00Z,2\n2025-11-27T09:00:00Z,2,2';

    const h2File: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'h2File.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: Buffer.from(h2Content, 'utf-8'),
      size: Buffer.byteLength(h2Content),
      destination: '',
      filename: 'h2File',
      path: '',
      stream: null as any,
    };

    jest.spyOn(generalSvc, 'send').mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
      of({
        company: {
          id: 'company-power-production-1',
        },
      }),
    );

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(expectedResponse));

    const dto: ProductionCSVUploadDto = { unitIds: ['id', 'id'], csvContentType: CsvContentType.HYDROGEN };

    expect(() => controller.importCsvFile(dto, [powerFile, h2File], givenAuthenticatedUser)).toThrow(
      NotImplementedException,
    );
  });

  it('should throw error because unitId is missing', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };
    const dto: ProductionCSVUploadDto = { unitIds: [], csvContentType: CsvContentType.HYDROGEN };

    const powerContent = 'time,amount\n2025-11-27T09:00:00Z,2\n2025-11-27T09:00:00Z,2';
    const powerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'powerFile.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      buffer: Buffer.from(powerContent, 'utf-8'),
      size: Buffer.byteLength(powerContent),
      destination: '',
      filename: 'powerFile',
      path: '',
      stream: null as any,
    };

    expect(() => controller.importCsvFile(dto, [powerFile], givenAuthenticatedUser)).toThrow(NotImplementedException);
  });

  it('should verify csv document integrity and return verification details', async () => {
    // arrange
    const blockTimestamp = new Date('2026-02-18T10:26:29.000Z');

    const givenVerificationEntity = new VerifyCsvDocumentIntegrityResultEntity(
      'document-1',
      'file.csv',
      CsvDocumentIntegrityStatus.VERIFIED,
      'File integrity verified successfully for document with id document-1.',
      '0xhash',
      123,
      blockTimestamp,
      'Arbitrum Sepolia',
      '0xcontract',
      'https://sepolia.arbiscan.io/tx/0xhash',
      'some-cid',
      'https://ipfs.io/ipfs/some-cid',
    );

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProductionMessagePatterns, _data: any) => of(givenVerificationEntity));

    // act
    const actualResponse = await controller.verifyCsvDocumentIntegrity(givenVerificationEntity.documentId);

    // assert
    expect(actualResponse).toEqual(CsvDocumentIntegrityResultDto.fromEntity(givenVerificationEntity));
    expect(processSvc.send).toHaveBeenCalledWith(
      ProductionMessagePatterns.VERIFY_CSV_DOCUMENT_INTEGRITY,
      expect.objectContaining({ id: givenVerificationEntity.documentId }),
    );
  });
});
