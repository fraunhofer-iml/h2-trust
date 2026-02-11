/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BatchEntityHydrogenProducedMock,
  BrokerQueues,
  HydrogenProductionUnitEntityMock,
  PowerProductionTypeEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  UserEntityHydrogenMock,
} from '@h2-trust/amqp';
import {
  AccountingPeriodMatchingResultDto,
  AuthenticatedKCUser,
  CreateProductionDto,
  CreateProductionDtoMock,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import { EnergySource, HydrogenColor, PowerProductionType, ProcessType } from '@h2-trust/domain';
import 'multer';
import { of } from 'rxjs';
import { StorageService } from '@h2-trust/storage';
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
          provide: StorageService,
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

  it('should create production', async () => {
    const givenDto: CreateProductionDto = CreateProductionDtoMock;

    jest
      .spyOn(generalSvc, 'send')
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of({
          ratedPower: 100,
          type: <PowerProductionTypeEntity>{
            name: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
            energySource: EnergySource.SOLAR_ENERGY,
            hydrogenColor: HydrogenColor.GREEN,
          },
        }),
      )
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of({
          company: {
            id: 'company-power-production-1',
          },
        }),
      )
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of({
          company: {
            id: 'company-hydrogen-production-1',
          },
        }),
      );

    const mockedProcessStepEntities: ProcessStepEntity[] = [
      {
        id: 'hydrogen-production-process-step-1',
        startedAt: new Date(CreateProductionDtoMock.productionStartedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        type: ProcessType.HYDROGEN_PRODUCTION,
        batch: BatchEntityHydrogenProducedMock[0],
        recordedBy: UserEntityHydrogenMock,
        executedBy: HydrogenProductionUnitEntityMock[0],
      },
      {
        id: 'hydrogen-production-process-step-2',
        startedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        type: ProcessType.HYDROGEN_PRODUCTION,
        batch: BatchEntityHydrogenProducedMock[0],
        recordedBy: UserEntityHydrogenMock,
        executedBy: HydrogenProductionUnitEntityMock[0],
      },
    ];

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(mockedProcessStepEntities));

    const expectedResponse: ProductionOverviewDto[] = mockedProcessStepEntities.map(ProductionOverviewDto.fromEntity);
    const actualResponse: ProductionOverviewDto[] = await controller.createProductions(givenDto, { sub: 'user-1' });

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read hydrogen productions', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };
    const processStepEntityMocks: ProcessStepEntity[] = [
      {
        id: 'hydrogen-production-process-step-1',
        startedAt: new Date(CreateProductionDtoMock.productionStartedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        type: ProcessType.HYDROGEN_PRODUCTION,
        batch: BatchEntityHydrogenProducedMock[0],
        recordedBy: UserEntityHydrogenMock,
        executedBy: HydrogenProductionUnitEntityMock[0],
      },
    ];

    const expectedResponse: ProductionOverviewDto[] = processStepEntityMocks.map(ProductionOverviewDto.fromEntity);

    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(UserDetailsDtoMock[0]);

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepEntityMocks));

    const actualResponse: ProductionOverviewDto[] =
      await controller.readHydrogenProductionsByOwner(givenAuthenticatedUser);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw because files are missing ', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };

    const dto: ProductionCSVUploadDto = { hydrogenProductionUnitIds: [], powerProductionUnitIds: [] };

    await expect(
      controller.importCsvFile(dto, { powerProductionFiles: [], hydrogenProductionFiles: [] }, givenAuthenticatedUser),
    ).rejects.toThrow(Error);
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

    const dto: ProductionCSVUploadDto = {
      hydrogenProductionUnitIds: ['hydrogen-production-unit-1'],
      powerProductionUnitIds: ['power-production-unit-1'],
    };

    const actualResponse = await controller.importCsvFile(
      dto,
      { powerProductionFiles: [powerFile], hydrogenProductionFiles: [h2File] },
      givenAuthenticatedUser,
    );

    expect(actualResponse.numberOfBatches).toBe(1);
  });

  it('should throw error because unitId is missing', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };
    const dto: ProductionCSVUploadDto = { hydrogenProductionUnitIds: ['test-id'], powerProductionUnitIds: [] };

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

    await expect(
      controller.importCsvFile(
        dto,
        { powerProductionFiles: [powerFile], hydrogenProductionFiles: [h2File] },
        givenAuthenticatedUser,
      ),
    ).rejects.toThrow('Not enough unit IDs provided for POWER production files: expected 1, got 0');
  });
});
