/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitEntityFixture } from 'libs/amqp/src/lib/fixtures/hydrogen-storage-unit.entity.fixture';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  PowerProductionUnitEntity,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitCreateDtoMock,
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitCreateDtoMock,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  PowerProductionUnitCreateDtoMock,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { HydrogenProductionUnitEntityFixture, PowerProductionUnitEntityFixture } from '@h2-trust/fixtures/entities';
import { UserService } from '../user/user.service';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

describe('UnitController', () => {
  let controller: UnitController;
  let queue: ClientProxy;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],
      providers: [
        UnitService,
        UserService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UnitController);
    queue = module.get(BrokerQueues.QUEUE_GENERAL_SVC);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find a unit', async () => {
    const givenUserId = 'unit-id-1';
    const fixtureUnit: HydrogenProductionUnitEntity = HydrogenProductionUnitEntityFixture.create();

    const expectedResponse: HydrogenProductionUnitDto = HydrogenProductionUnitDto.fromEntity(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse: HydrogenProductionUnitDto = await controller.getHydrogenProductionUnitById(givenUserId);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(UnitMessagePatterns.READ, new ReadByIdPayload(givenUserId));
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should find all units', async () => {
    const givenUserId = 'user-id-1';
    const fixtureUser = { company: { id: 'companyId' } } as UserDetailsDto;
    const fixtureUnits: HydrogenProductionUnitEntity[] = [HydrogenProductionUnitEntityFixture.create()];
    const expectedResponse: HydrogenProductionOverviewDto[] = fixtureUnits.map(
      HydrogenProductionOverviewDto.fromEntity,
    );

    const readUserRequestSpy = jest.spyOn(userService, 'readUserWithCompany');
    readUserRequestSpy.mockResolvedValue(fixtureUser);
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnits);
    });

    const actualResponse: HydrogenProductionOverviewDto[] = await controller.getHydrogenProductionUnits({
      sub: givenUserId,
    });

    expect(readUserRequestSpy).toHaveBeenCalledTimes(1);
    expect(readUserRequestSpy).toHaveBeenCalledWith(givenUserId);
    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS,
      new ReadByIdPayload(fixtureUser.company.id),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create power production unit', async () => {
    const givenDto: PowerProductionUnitInputDto = PowerProductionUnitCreateDtoMock[0];
    const fixtureUnit: PowerProductionUnitEntity = PowerProductionUnitEntityFixture.create();
    const expectedResponse: PowerProductionUnitDto = PowerProductionUnitDto.fromEntity(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createPowerProductionUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT,
      PowerProductionUnitInputDto.toPayload(givenDto as PowerProductionUnitInputDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen production unit', async () => {
    const givenDto: HydrogenProductionUnitInputDto = HydrogenProductionUnitCreateDtoMock[0];
    const fixtureUnit: HydrogenProductionUnitEntity = HydrogenProductionUnitEntityFixture.create();
    const expectedResponse: HydrogenProductionUnitDto = HydrogenProductionUnitDto.fromEntity(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createHydrogenProductionUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT,
      HydrogenProductionUnitInputDto.toPayload(givenDto as HydrogenProductionUnitInputDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen storage unit', async () => {
    const givenDto: HydrogenStorageUnitInputDto = HydrogenStorageUnitCreateDtoMock[0];
    const fixtureUnit: HydrogenStorageUnitEntity = HydrogenStorageUnitEntityFixture.create();
    const expectedResponse: HydrogenStorageUnitDto = HydrogenStorageUnitDto.fromEntity(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createHydrogenStorageUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT,
      HydrogenStorageUnitInputDto.toPayload(givenDto as HydrogenStorageUnitInputDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });
});
