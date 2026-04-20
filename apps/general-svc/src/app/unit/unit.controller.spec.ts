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
  BrokerQueues,
} from '@h2-trust/messaging';
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
import {
  CompanyEntityFixture,
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
} from '@h2-trust/contracts/testing';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { PowerProductionUnitEntity, HydrogenProductionUnitEntity, HydrogenStorageUnitEntity, AddressPayload, CreateHydrogenProductionUnitPayload, CreateHydrogenStorageUnitPayload, CreatePowerProductionUnitPayload, ReadByIdPayload } from '@h2-trust/contracts';

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
    const givenPowerProductionUnit = PowerProductionUnitEntityFixture.create();
    const givenPowerCompany = CompanyEntityFixture.createPowerProducer();
    const givenPayload = new CreatePowerProductionUnitPayload(
      givenPowerProductionUnit.name,
      givenPowerProductionUnit.mastrNumber,
      givenPowerProductionUnit.commissionedOn,
      new AddressPayload(
        givenPowerProductionUnit.address.street,
        givenPowerProductionUnit.address.postalCode,
        givenPowerProductionUnit.address.city,
        givenPowerProductionUnit.address.state,
        givenPowerProductionUnit.address.country,
      ),
      givenPowerCompany.id,
      givenPowerProductionUnit.electricityMeterNumber,
      givenPowerProductionUnit.ratedPower,
      givenPowerProductionUnit.gridLevel,
      givenPowerProductionUnit.biddingZone,
      givenPowerProductionUnit.financialSupportReceived,
      givenPowerProductionUnit.type.name,
      givenPowerProductionUnit.manufacturer,
      givenPowerProductionUnit.modelType,
      givenPowerProductionUnit.modelNumber,
      givenPowerProductionUnit.serialNumber,
      givenPowerProductionUnit.certifiedBy,
      givenPowerCompany.id,
      givenPowerProductionUnit.decommissioningPlannedOn,
      givenPowerProductionUnit.gridOperator,
      givenPowerProductionUnit.gridConnectionNumber,
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
    const givenHydrogenProductionUnit = HydrogenProductionUnitEntityFixture.create();
    const givenHydrogenCompany = CompanyEntityFixture.createHydrogenProducer();
    const givenPayload = new CreateHydrogenProductionUnitPayload(
      givenHydrogenProductionUnit.name,
      givenHydrogenProductionUnit.mastrNumber,
      givenHydrogenProductionUnit.commissionedOn,
      new AddressPayload(
        givenHydrogenProductionUnit.address.street,
        givenHydrogenProductionUnit.address.postalCode,
        givenHydrogenProductionUnit.address.city,
        givenHydrogenProductionUnit.address.state,
        givenHydrogenProductionUnit.address.country,
      ),
      givenHydrogenCompany.id,
      givenHydrogenProductionUnit.method,
      givenHydrogenProductionUnit.technology,
      givenHydrogenProductionUnit.biddingZone,
      givenHydrogenProductionUnit.ratedPower,
      givenHydrogenProductionUnit.pressure,
      givenHydrogenProductionUnit.waterConsumptionLitersPerHour,
      givenHydrogenProductionUnit.manufacturer,
      givenHydrogenProductionUnit.modelType,
      givenHydrogenProductionUnit.modelNumber,
      givenHydrogenProductionUnit.serialNumber,
      givenHydrogenProductionUnit.certifiedBy,
      givenHydrogenCompany.id,
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
    const givenHydrogenStorageUnit = HydrogenStorageUnitEntityFixture.create();
    const givenHydrogenCompany = CompanyEntityFixture.createHydrogenProducer();
    const givenPayload = new CreateHydrogenStorageUnitPayload(
      givenHydrogenStorageUnit.name,
      givenHydrogenStorageUnit.mastrNumber,
      givenHydrogenStorageUnit.commissionedOn,
      new AddressPayload(
        givenHydrogenStorageUnit.address.street,
        givenHydrogenStorageUnit.address.postalCode,
        givenHydrogenStorageUnit.address.city,
        givenHydrogenStorageUnit.address.state,
        givenHydrogenStorageUnit.address.country,
      ),
      givenHydrogenCompany.id,
      givenHydrogenStorageUnit.type,
      givenHydrogenStorageUnit.capacity,
      givenHydrogenStorageUnit.pressure,
      givenHydrogenStorageUnit.manufacturer,
      givenHydrogenStorageUnit.modelType,
      givenHydrogenStorageUnit.modelNumber,
      givenHydrogenStorageUnit.serialNumber,
      givenHydrogenStorageUnit.certifiedBy,
      givenHydrogenCompany.id,
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
