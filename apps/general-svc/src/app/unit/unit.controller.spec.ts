/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AddressPayload,
  BrokerQueues,
  CompanyEntityPowerMock,
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  HydrogenProductionUnitEntity,
  HydrogenProductionUnitEntityMock,
  HydrogenStorageUnitEntity,
  HydrogenStorageUnitEntityMock,
  PowerProductionUnitEntity,
  PowerProductionUnitEntityMock,
  ReadByIdPayload,
} from '@h2-trust/amqp';
import {
  BaseUnitDeepDbTypeMock,
  baseUnitDeepQueryArgs,
  DatabaseModule,
  HydrogenProductionUnitDeepDbTypeMock,
  HydrogenStorageUnitNestedDbTypeMock,
  PowerProductionUnitDeepDbTypeMock,
  PrismaService,
} from '@h2-trust/database';
import { RfnboType } from '@h2-trust/domain';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let prisma: PrismaService;
  let unitService: UnitService;
  let queue: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UnitController],
      providers: [
        UnitService,
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            unit: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UnitController>(UnitController);
    unitService = module.get(UnitService);
    prisma = module.get<PrismaService>(PrismaService);
    queue = module.get(BrokerQueues.QUEUE_PROCESS_SVC);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get unit by id', async () => {
    const expectedResponse = BaseUnitDeepDbTypeMock[0];
    expectedResponse.powerProductionUnit = PowerProductionUnitDeepDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readUnit({ id: expectedResponse.id });

    expect(actualResponse).toEqual(PowerProductionUnitEntity.fromDeepDatabase(expectedResponse));
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({
      where: {
        id: expectedResponse.id,
      },
      ...baseUnitDeepQueryArgs,
    });
  });

  it('should get power production units', async () => {
    const expectedResponse = BaseUnitDeepDbTypeMock[0];

    expectedResponse.powerProductionUnit = PowerProductionUnitDeepDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readPowerProductionUnitsByOwnerId(
      new ReadByIdPayload(expectedResponse.ownerId),
    );

    expect(actualResponse).toEqual([PowerProductionUnitEntity.fromDeepDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.operatorId,
        powerProductionUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
  });

  it('should get hydrogen production units', async () => {
    const expectedResponse = BaseUnitDeepDbTypeMock[0];
    expectedResponse.hydrogenProductionUnit = HydrogenProductionUnitDeepDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenProductionUnits(new ReadByIdPayload(expectedResponse.ownerId));

    expect(actualResponse).toEqual([HydrogenProductionUnitEntity.fromDeepDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.ownerId,
        hydrogenProductionUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
  });

  it('should get hydrogen storage units', async () => {
    const expectedResponse = BaseUnitDeepDbTypeMock[0];
    expectedResponse.hydrogenStorageUnit = HydrogenStorageUnitNestedDbTypeMock[0];
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation(() => {
      return of(RfnboType.NOT_SPECIFIED);
    });

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenStorageUnits(new ReadByIdPayload(expectedResponse.ownerId));

    expect(actualResponse).toEqual([HydrogenStorageUnitEntity.fromDeepDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.ownerId,
        hydrogenStorageUnit: {
          isNot: null,
        },
      },
      ...baseUnitDeepQueryArgs,
    });
  });

  it('should create power production unit', async () => {
    const givenPayload: CreatePowerProductionUnitPayload = new CreatePowerProductionUnitPayload(
      PowerProductionUnitEntityMock[0].name,
      PowerProductionUnitEntityMock[0].mastrNumber,
      PowerProductionUnitEntityMock[0].commissionedOn,
      new AddressPayload(
        PowerProductionUnitEntityMock[0].address.street,
        PowerProductionUnitEntityMock[0].address.postalCode,
        PowerProductionUnitEntityMock[0].address.city,
        PowerProductionUnitEntityMock[0].address.state,
        PowerProductionUnitEntityMock[0].address.country,
      ),
      CompanyEntityPowerMock.id,
      PowerProductionUnitEntityMock[0].electricityMeterNumber,
      PowerProductionUnitEntityMock[0].ratedPower,
      PowerProductionUnitEntityMock[0].gridLevel,
      PowerProductionUnitEntityMock[0].biddingZone,
      PowerProductionUnitEntityMock[0].financialSupportReceived,
      PowerProductionUnitEntityMock[0].type.name,
      PowerProductionUnitEntityMock[0].manufacturer,
      PowerProductionUnitEntityMock[0].modelType,
      PowerProductionUnitEntityMock[0].modelNumber,
      PowerProductionUnitEntityMock[0].serialNumber,
      PowerProductionUnitEntityMock[0].certifiedBy,
      CompanyEntityPowerMock.id,
      PowerProductionUnitEntityMock[0].decommissioningPlannedOn,
      PowerProductionUnitEntityMock[0].gridOperator,
      PowerProductionUnitEntityMock[0].gridConnectionNumber,
    );

    const mockedDbResponse = BaseUnitDeepDbTypeMock[0];
    mockedDbResponse.powerProductionUnit = PowerProductionUnitDeepDbTypeMock[0];
    const expectedResponse: PowerProductionUnitEntity = PowerProductionUnitEntity.fromDeepDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreatePowerProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createPowerProductionUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen production unit', async () => {
    const givenPayload: CreateHydrogenProductionUnitPayload = new CreateHydrogenProductionUnitPayload(
      HydrogenProductionUnitEntityMock[0].name,
      HydrogenProductionUnitEntityMock[0].mastrNumber,
      HydrogenProductionUnitEntityMock[0].commissionedOn,
      new AddressPayload(
        HydrogenProductionUnitEntityMock[0].address.street,
        HydrogenProductionUnitEntityMock[0].address.postalCode,
        HydrogenProductionUnitEntityMock[0].address.city,
        HydrogenProductionUnitEntityMock[0].address.state,
        HydrogenProductionUnitEntityMock[0].address.country,
      ),
      CompanyEntityPowerMock.id,
      HydrogenProductionUnitEntityMock[0].method,
      HydrogenProductionUnitEntityMock[0].technology,
      HydrogenProductionUnitEntityMock[0].biddingZone,
      HydrogenProductionUnitEntityMock[0].ratedPower,
      HydrogenProductionUnitEntityMock[0].pressure,
      HydrogenProductionUnitEntityMock[0].waterConsumptionLitersPerHour,
      HydrogenProductionUnitEntityMock[0].manufacturer,
      HydrogenProductionUnitEntityMock[0].modelType,
      HydrogenProductionUnitEntityMock[0].modelNumber,
      HydrogenProductionUnitEntityMock[0].serialNumber,
      HydrogenProductionUnitEntityMock[0].certifiedBy,
      CompanyEntityPowerMock.id,
    );
    const mockedDbResponse = BaseUnitDeepDbTypeMock[0];
    mockedDbResponse.hydrogenProductionUnit = HydrogenProductionUnitDeepDbTypeMock[0];
    const expectedResponse: HydrogenProductionUnitEntity =
      HydrogenProductionUnitEntity.fromDeepDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreateHydrogenProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenProductionUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen storage unit', async () => {
    const givenPayload: CreateHydrogenStorageUnitPayload = new CreateHydrogenStorageUnitPayload(
      HydrogenStorageUnitEntityMock[0].name,
      HydrogenStorageUnitEntityMock[0].mastrNumber,
      HydrogenStorageUnitEntityMock[0].commissionedOn,
      new AddressPayload(
        HydrogenStorageUnitEntityMock[0].address.street,
        HydrogenStorageUnitEntityMock[0].address.postalCode,
        HydrogenStorageUnitEntityMock[0].address.city,
        HydrogenStorageUnitEntityMock[0].address.state,
        HydrogenStorageUnitEntityMock[0].address.country,
      ),
      CompanyEntityPowerMock.id,
      HydrogenStorageUnitEntityMock[0].type,
      HydrogenStorageUnitEntityMock[0].capacity,
      HydrogenStorageUnitEntityMock[0].pressure,
      HydrogenStorageUnitEntityMock[0].manufacturer,
      HydrogenStorageUnitEntityMock[0].modelType,
      HydrogenStorageUnitEntityMock[0].modelNumber,
      HydrogenStorageUnitEntityMock[0].serialNumber,
      HydrogenStorageUnitEntityMock[0].certifiedBy,
      CompanyEntityPowerMock.id,
    );
    const mockedDbResponse = BaseUnitDeepDbTypeMock[0];
    mockedDbResponse.hydrogenStorageUnit = HydrogenStorageUnitNestedDbTypeMock[0];
    const expectedResponse: HydrogenStorageUnitEntity = HydrogenStorageUnitEntity.fromNestedDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreateHydrogenStorageUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenStorageUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
