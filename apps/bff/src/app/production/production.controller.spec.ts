/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, PowerProductionTypeEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import 'multer';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  AuthenticatedKCUser,
  CreateProductionDto,
  CreateProductionDtoMock,
  ProductionOverviewDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import { EnergySource, HydrogenColor, ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

describe('ProductionController', () => {
  let controller: ProductionController;
  let batchSvc: ClientProxy;
  let generalSvc: ClientProxy;
  let processSvc: ClientProxy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ProductionController],
      providers: [
        ProductionService,
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
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
          provide: UserService,
          useValue: {
            readUserWithCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    batchSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
    processSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_PROCESS_SVC) as ClientProxy;
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create production', async () => {
    const givenDto: CreateProductionDto = CreateProductionDtoMock;

    jest
      .spyOn(generalSvc, 'send')
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of({
          ratedPower: 100,
          type: <PowerProductionTypeEntity>{
            name: 'Test Power Production Unit Type',
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
      },
      {
        id: 'hydrogen-production-process-step-2',
        startedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
        type: ProcessType.HYDROGEN_PRODUCTION,
      },
    ];

    jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(mockedProcessStepEntities));

    const expectedResponse: ProductionOverviewDto[] = mockedProcessStepEntities.map(ProductionOverviewDto.fromEntity);
    const actualResponse: ProductionOverviewDto[] = await controller.createProduction(givenDto, { sub: 'user-1' });

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read hydrogen productions', async () => {
    const givenAuthenticatedUser: AuthenticatedKCUser = { sub: 'user-1' };
    const processStepEntityMocks: ProcessStepEntity[] = [
      {
        id: 'hydrogen-production-process-step-1',
        startedAt: new Date(CreateProductionDtoMock.productionStartedAt),
        endedAt: new Date(CreateProductionDtoMock.productionEndedAt),
      },
    ];

    const expectedResponse: ProductionOverviewDto[] = processStepEntityMocks.map(ProductionOverviewDto.fromEntity);

    jest.spyOn(userService, 'readUserWithCompany').mockResolvedValue(UserDetailsDtoMock[0]);

    jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepEntityMocks));

    const actualResponse: ProductionOverviewDto[] =
      await controller.readHydrogenProductionsByCompany(givenAuthenticatedUser);

    expect(actualResponse).toEqual(expectedResponse);
  });
});
