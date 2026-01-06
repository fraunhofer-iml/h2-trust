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
  HydrogenProductionUnitEntity,
  HydrogenProductionUnitEntityMock,
  HydrogenStorageUnitEntity,
  HydrogenStorageUnitEntityMock,
  PowerProductionUnitEntity,
  PowerProductionUnitEntityMock,
  ReadByIdPayload,
  UnitMessagePatterns,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitCreateDto,
  HydrogenProductionUnitCreateDtoMock,
  HydrogenStorageUnitCreateDto,
  HydrogenStorageUnitCreateDtoMock,
  PowerProductionUnitCreateDto,
  PowerProductionUnitCreateDtoMock,
  UnitCreateDto,
  UnitDto,
  UnitOverviewDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { UnitType } from '@h2-trust/domain';
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
    const fixtureUnit: HydrogenProductionUnitEntity = HydrogenProductionUnitEntityMock[0];
    const expectedResponse: UnitDto = UnitService.mapEntityToDto(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse: UnitDto = await controller.getUnit(givenUserId);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(UnitMessagePatterns.READ, ReadByIdPayload.of(givenUserId));
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should find all units', async () => {
    const givenUserId = 'user-id-1';
    const fixtureUser = { company: { id: 'companyId' } } as UserDetailsDto;
    const fixtureUnits: HydrogenProductionUnitEntity[] = HydrogenProductionUnitEntityMock;
    const expectedResponse: HydrogenProductionOverviewDto[] = fixtureUnits.map(
      HydrogenProductionOverviewDto.fromEntity,
    );

    const readUserRequestSpy = jest.spyOn(userService, 'readUserWithCompany');
    readUserRequestSpy.mockResolvedValue(fixtureUser);
    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnits);
    });

    const actualResponse: UnitOverviewDto[] = await controller.getUnits(UnitType.HYDROGEN_PRODUCTION, {
      sub: givenUserId,
    });
    expect(readUserRequestSpy).toHaveBeenCalledTimes(1);
    expect(readUserRequestSpy).toHaveBeenCalledWith(givenUserId);
    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.READ_HYDROGEN_PRODUCTION_UNITS,
      ReadByIdPayload.of(fixtureUser.company.id),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create power production unit', async () => {
    const givenDto: PowerProductionUnitCreateDto = PowerProductionUnitCreateDtoMock[0];
    const fixtureUnit: PowerProductionUnitEntity = PowerProductionUnitEntityMock[0];
    const expectedResponse: UnitDto = UnitService.mapEntityToDto(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_POWER_PRODUCTION_UNIT,
      PowerProductionUnitCreateDto.toPayload(givenDto as PowerProductionUnitCreateDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen production unit', async () => {
    const givenDto: HydrogenProductionUnitCreateDto = HydrogenProductionUnitCreateDtoMock[0];
    const fixtureUnit: HydrogenProductionUnitEntity = HydrogenProductionUnitEntityMock[0];
    const expectedResponse: UnitDto = UnitService.mapEntityToDto(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_PRODUCTION_UNIT,
      HydrogenProductionUnitCreateDto.toPayload(givenDto as HydrogenProductionUnitCreateDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen storage unit', async () => {
    const givenDto: HydrogenStorageUnitCreateDto = HydrogenStorageUnitCreateDtoMock[0];
    const fixtureUnit: HydrogenStorageUnitEntity = HydrogenStorageUnitEntityMock[0];
    const expectedResponse: UnitDto = UnitService.mapEntityToDto(fixtureUnit);

    const sendRequestSpy = jest.spyOn(queue, 'send');
    sendRequestSpy.mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => {
      return of(fixtureUnit);
    });

    const actualResponse = await controller.createUnit(givenDto);

    expect(sendRequestSpy).toHaveBeenCalledTimes(1);
    expect(sendRequestSpy).toHaveBeenCalledWith(
      UnitMessagePatterns.CREATE_HYDROGEN_STORAGE_UNIT,
      HydrogenStorageUnitCreateDto.toPayload(givenDto as HydrogenStorageUnitCreateDto),
    );
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should fail by unknown unit type', async () => {
    const givenDto = { unitType: 'UNKNOWN' } as unknown as UnitCreateDto;

    const expectedErrorMessage = `Unit type [${givenDto.unitType}] unknown`;

    await expect(controller.createUnit(givenDto)).rejects.toThrow(expectedErrorMessage);
  });
});
