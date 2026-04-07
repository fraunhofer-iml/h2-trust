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
  CreateHydrogenProductionUnitPayload,
  CreateHydrogenStorageUnitPayload,
  CreatePowerProductionUnitPayload,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  ReadByIdPayload,
} from '@h2-trust/amqp';
import {
  allUnitsQueryArgs,
  DatabaseModule,
  HydrogenProductionUnitDbType,
  HydrogenProductionUnitDbTypeMock,
  hydrogenProductionUnitQueryArgs,
  HydrogenStorageUnitDbType,
  HydrogenStorageUnitDbTypeMock,
  hydrogenStorageUnitQueryArgs,
  PowerProductionUnitDbType,
  PowerProductionUnitDbTypeMock,
  powerProductionUnitQueryArgs,
  PrismaService,
} from '@h2-trust/database';
import { RfnboType } from '@h2-trust/domain';
import {
  CompanyEntityFixture,
  HydrogenProductionUnitEntityFixture,
  HydrogenStorageUnitEntityFixture,
  PowerProductionUnitEntityFixture,
} from '@h2-trust/fixtures/entities';
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
    const expectedResponse = PowerProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findUnique').mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readUnit({ id: expectedResponse.id });

    expect(actualResponse).toEqual(PowerProductionUnitEntity.fromDatabase(expectedResponse));
    expect(prisma.unit.findUnique).toHaveBeenCalledWith({
      where: {
        id: expectedResponse.id,
      },
      ...allUnitsQueryArgs,
    });
  });

  it('should get power production units', async () => {
    const expectedResponse = PowerProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readPowerProductionUnitsByOwnerId(
      new ReadByIdPayload(expectedResponse.ownerId),
    );

    expect(actualResponse).toEqual([PowerProductionUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.operatorId,
        powerProductionUnit: {
          isNot: null,
        },
      },
      ...powerProductionUnitQueryArgs,
    });
  });

  it('should get hydrogen production units', async () => {
    const expectedResponse = HydrogenProductionUnitDbTypeMock[0];

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenProductionUnits(new ReadByIdPayload(expectedResponse.ownerId));

    expect(actualResponse).toEqual([HydrogenProductionUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.ownerId,
        hydrogenProductionUnit: {
          isNot: null,
        },
      },
      ...hydrogenProductionUnitQueryArgs,
    });
  });

  it('should get hydrogen storage units', async () => {
    const expectedResponse = HydrogenStorageUnitDbTypeMock[0];
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation(() => {
      return of(RfnboType.NOT_SPECIFIED);
    });

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenStorageUnits(new ReadByIdPayload(expectedResponse.ownerId));

    expect(actualResponse).toEqual([HydrogenStorageUnitEntity.fromDatabase(expectedResponse)]);
    expect(prisma.unit.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: expectedResponse.ownerId,
        hydrogenStorageUnit: {
          isNot: null,
        },
      },
      ...hydrogenStorageUnitQueryArgs,
    });
  });

  it('should create power production unit', async () => {
    const givenPowerProduction = PowerProductionUnitEntityFixture.create();
    const giveCompanyEntityPower = CompanyEntityFixture.createPowerProducer();
    const givenPayload: CreatePowerProductionUnitPayload = new CreatePowerProductionUnitPayload(
      givenPowerProduction.name,
      givenPowerProduction.mastrNumber,
      givenPowerProduction.commissionedOn,
      new AddressPayload(
        givenPowerProduction.address.street,
        givenPowerProduction.address.postalCode,
        givenPowerProduction.address.city,
        givenPowerProduction.address.state,
        givenPowerProduction.address.country,
      ),
      giveCompanyEntityPower.id,
      givenPowerProduction.electricityMeterNumber,
      givenPowerProduction.ratedPower,
      givenPowerProduction.gridLevel,
      givenPowerProduction.biddingZone,
      givenPowerProduction.financialSupportReceived,
      givenPowerProduction.type.name,
      givenPowerProduction.manufacturer,
      givenPowerProduction.modelType,
      givenPowerProduction.modelNumber,
      givenPowerProduction.serialNumber,
      givenPowerProduction.certifiedBy,
      giveCompanyEntityPower.id,
      givenPowerProduction.decommissioningPlannedOn,
      givenPowerProduction.gridOperator,
      givenPowerProduction.gridConnectionNumber,
    );
    const mockedDbResponse: PowerProductionUnitDbType = PowerProductionUnitDbTypeMock[0];
    const expectedResponse: PowerProductionUnitEntity = PowerProductionUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreatePowerProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createPowerProductionUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen production unit', async () => {
    const givenHydrogenProduction = HydrogenProductionUnitEntityFixture.create();
    const giveCompanyEntityPower = CompanyEntityFixture.createPowerProducer();
    const givenPayload: CreateHydrogenProductionUnitPayload = new CreateHydrogenProductionUnitPayload(
      givenHydrogenProduction.name,
      givenHydrogenProduction.mastrNumber,
      givenHydrogenProduction.commissionedOn,
      new AddressPayload(
        givenHydrogenProduction.address.street,
        givenHydrogenProduction.address.postalCode,
        givenHydrogenProduction.address.city,
        givenHydrogenProduction.address.state,
        givenHydrogenProduction.address.country,
      ),
      giveCompanyEntityPower.id,
      givenHydrogenProduction.method,
      givenHydrogenProduction.technology,
      givenHydrogenProduction.biddingZone,
      givenHydrogenProduction.ratedPower,
      givenHydrogenProduction.pressure,
      givenHydrogenProduction.waterConsumptionLitersPerHour,
      givenHydrogenProduction.manufacturer,
      givenHydrogenProduction.modelType,
      givenHydrogenProduction.modelNumber,
      givenHydrogenProduction.serialNumber,
      givenHydrogenProduction.certifiedBy,
      giveCompanyEntityPower.id,
    );

    const mockedDbResponse: HydrogenProductionUnitDbType = HydrogenProductionUnitDbTypeMock[0];
    const expectedResponse: HydrogenProductionUnitEntity = HydrogenProductionUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreateHydrogenProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenProductionUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen storage unit', async () => {
    const givenHydrogenStorage = HydrogenStorageUnitEntityFixture.create();
    const giveCompanyEntityPower = CompanyEntityFixture.createPowerProducer();
    const givenPayload: CreateHydrogenStorageUnitPayload = new CreateHydrogenStorageUnitPayload(
      givenHydrogenStorage.name,
      givenHydrogenStorage.mastrNumber,
      givenHydrogenStorage.commissionedOn,
      new AddressPayload(
        givenHydrogenStorage.address.street,
        givenHydrogenStorage.address.postalCode,
        givenHydrogenStorage.address.city,
        givenHydrogenStorage.address.state,
        givenHydrogenStorage.address.country,
      ),
      giveCompanyEntityPower.id,
      givenHydrogenStorage.type,
      givenHydrogenStorage.capacity,
      givenHydrogenStorage.pressure,
      givenHydrogenStorage.manufacturer,
      givenHydrogenStorage.modelType,
      givenHydrogenStorage.modelNumber,
      givenHydrogenStorage.serialNumber,
      givenHydrogenStorage.certifiedBy,
      giveCompanyEntityPower.id,
    );

    const mockedDbResponse: HydrogenStorageUnitDbType = HydrogenStorageUnitDbTypeMock[0];
    const expectedResponse: HydrogenStorageUnitEntity = HydrogenStorageUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'updateOrCreateHydrogenStorageUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'upsert').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenStorageUnit(givenPayload);

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
