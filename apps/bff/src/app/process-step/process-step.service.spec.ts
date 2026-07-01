/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { DigitalProductPassportDto, ProcessStepOverviewDto } from '@h2-trust/contracts/dtos';
import {
  ComponentsOverviewDtoFixture,
  CreateProcessStepDtoFixture,
  UserDetailsDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { HydrogenComponentEntity, UnitEntity } from '@h2-trust/contracts/entities';
import {
  DigitalProductPassportEntityFixture,
  HydrogenBottlingUnitEntityFixture,
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateProcessStepPayload,
  CreateProcessStepPayloadFixture,
  ReadByIdPayload,
  ReadProcessStepsByUnitsPayload,
} from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';
import { DigitalProductPassportMessagePatterns, ProcessStepMessagePatterns } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;

  const processSvcMock = {
    send: jest.fn(),
  };

  const generalService = {
    send: jest.fn(),
  };

  const userServiceMock = {
    readUserWithCompany: jest.fn(),
  };

  beforeEach(() => {
    service = new ProcessStepService(
      processSvcMock as unknown as ClientProxy,
      generalService as unknown as ClientProxy,
      userServiceMock as unknown as UserService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create bottling first and transportation second when both process calls succeed', async () => {
    // arrange
    const givenDto = CreateProcessStepDtoFixture.create({ processType: ProcessType.HYDROGEN_TRANSPORTATION });
    const givenFiles: Express.Multer.File[] = [];
    const givenUserId = 'user-id-1';
    const givenPersistedBottling = ProcessStepEntityFixture.createHydrogenBottling({
      startedAt: new Date(givenDto.filledAt),
      endedAt: new Date(givenDto.filledAt),
    });
    const expectedPersistedTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
      id: 'transportation-1',
      batch: givenPersistedBottling.batch,
    });

    const expectedTransportCreatePayload: CreateProcessStepPayload = CreateProcessStepPayloadFixture.create({
      amount: givenDto.amount,
      ownerId: givenDto.recipient,
      recordedById: givenDto.recordedBy,
      startedAt: new Date(givenDto.filledAt),
      endedAt: new Date(givenDto.filledAt),
      executingUnitId: givenDto.executingUnitId,
    });

    processSvcMock.send.mockImplementationOnce((_pattern, _payload) => of(expectedPersistedTransportation));

    // act
    const actualResult = await service.createProcessStep(givenDto, givenFiles, givenUserId);

    // assert
    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.CREATE_PROCESS_STEP,
      expectedTransportCreatePayload,
    );
    expect(actualResult).toEqual(ProcessStepOverviewDto.fromEntity(expectedPersistedTransportation));
  });

  it('should resolve the owner company and request active bottling steps when reading bottlings by owner', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenUserDetails = UserDetailsDtoFixture.create({
      company: {
        ...UserDetailsDtoFixture.create().company,
        id: 'company-id-1',
        name: 'Company',
      },
    });
    const givenUnit: UnitEntity = HydrogenBottlingUnitEntityFixture.create();
    const expectedHydrogenComponents: HydrogenComponentEntity[] = [
      HydrogenComponentEntityFixture.createRfnboReady({
        amount: 100,
      }),
    ];
    const expectedUnits = [givenUnit];

    const expectedComponentsOverviewDtos = [
      ComponentsOverviewDtoFixture.create({
        id: givenUnit.id,
        name: givenUnit.name,
        unitType: givenUnit.unitType,
        hydrogenComposition: [],
        capacity: 0,
        filling: 0,
        active: givenUnit.active,
      }),
    ];
    processSvcMock.send.mockClear();
    processSvcMock.send.mockReset();
    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedHydrogenComponents));
    generalService.send.mockImplementation((_pattern, _payload) => of(expectedUnits));

    // act
    const actualResult = await service.readHydrogenComponentsForOwnUnits(givenUserId);

    // assert
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(givenUserId);
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_ALL_BY_UNITS,
      new ReadProcessStepsByUnitsPayload([givenUnit.id]),
    );
    expect(actualResult).toEqual(expectedComponentsOverviewDtos);
  });

  it('should request the passport by id and map the response when reading a digital product passport', async () => {
    // arrange
    const givenPassportId = 'dpp-1';
    const expectedPassport = DigitalProductPassportEntityFixture.create();
    processSvcMock.send.mockClear();
    processSvcMock.send.mockReset();
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedPassport));

    // act
    const actualResult: DigitalProductPassportDto = await service.readDigitalProductPassport(givenPassportId);

    // assert
    expect(processSvcMock.send).toHaveBeenCalledWith(
      DigitalProductPassportMessagePatterns.READ,
      new ReadByIdPayload(givenPassportId),
    );
    expect(actualResult).toEqual(DigitalProductPassportDto.fromEntity(expectedPassport));
  });
});
