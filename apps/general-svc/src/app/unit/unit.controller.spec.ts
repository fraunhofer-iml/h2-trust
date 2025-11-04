/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  HydrogenProductionUnitEntity,
  HydrogenProductionUnitEntityMock,
  HydrogenStorageUnitEntity,
  HydrogenStorageUnitEntityMock,
  PowerProductionUnitEntity,
  PowerProductionUnitEntityMock,
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
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let prisma: PrismaService;
  let unitService: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UnitController],
      providers: [
        UnitService,
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

    const actualResponse = await controller.readPowerProductionUnits({ companyId: expectedResponse.ownerId });

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

    const actualResponse = await controller.readHydrogenProductionUnits({ companyId: expectedResponse.ownerId });

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

    jest.spyOn(prisma.unit, 'findMany').mockResolvedValue([expectedResponse]);

    const actualResponse = await controller.readHydrogenStorageUnits({ companyId: expectedResponse.ownerId });

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
    const givenPayload: PowerProductionUnitEntity = structuredClone(PowerProductionUnitEntityMock[0]);
    const mockedDbResponse: PowerProductionUnitDbType = PowerProductionUnitDbTypeMock[0];
    const expectedResponse: PowerProductionUnitEntity = PowerProductionUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'createPowerProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'create').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createPowerProductionUnit({ unit: givenPayload });

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen production unit', async () => {
    const givenPayload: HydrogenProductionUnitEntity = structuredClone(HydrogenProductionUnitEntityMock[0]);
    const mockedDbResponse: HydrogenProductionUnitDbType = HydrogenProductionUnitDbTypeMock[0];
    const expectedResponse: HydrogenProductionUnitEntity = HydrogenProductionUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'createHydrogenProductionUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'create').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenProductionUnit({ unit: givenPayload });

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen storage unit', async () => {
    const givenPayload: HydrogenStorageUnitEntity = structuredClone(HydrogenStorageUnitEntityMock[0]);
    const mockedDbResponse: HydrogenStorageUnitDbType = HydrogenStorageUnitDbTypeMock[0];
    const expectedResponse: HydrogenStorageUnitEntity = HydrogenStorageUnitEntity.fromDatabase(mockedDbResponse);

    const unitServiceSpy = jest.spyOn(unitService, 'createHydrogenStorageUnit');

    const prismaSpy = jest.spyOn(prisma.unit, 'create').mockResolvedValue(mockedDbResponse);

    const actualResponse = await controller.createHydrogenStorageUnit({ unit: givenPayload });

    expect(unitServiceSpy).toHaveBeenCalledTimes(1);
    expect(prismaSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
