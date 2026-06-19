/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { ComponentsOverviewDto, DigitalProductPassportDto, ProcessStepOverviewDto } from '@h2-trust/contracts/dtos';
import { CreateProcessStepDtoFixture, UserDetailsDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { DigitalProductPassportEntity, HydrogenComponentEntity, UnitEntity } from '@h2-trust/contracts/entities';
import {
  DocumentEntityFixture,
  HydrogenBottlingUnitEntityFixture,
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
  RedComplianceEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateProcessStepPayload,
  CreateProcessStepQualityPayload,
  ReadByIdPayload,
  ReadProcessStepsByUnitPayload,
} from '@h2-trust/contracts/payloads';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
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
    const expectedCreateQualityPayload: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
      RfnboType.RFNBO_READY,
      PowerType.RENEWABLE,
      0,
      0,
      1000,
      0,
      0,
      0,
      0,
    );
    const expectedTransportCreatePayload: CreateProcessStepPayload = new CreateProcessStepPayload(
      expectedCreateQualityPayload,
      ProcessType.HYDROGEN_TRANSPORTATION,
      givenDto.amount,
      givenDto.recipient,
      givenDto.recordedBy,
      new Date(givenDto.filledAt),
      new Date(givenDto.filledAt),
      givenDto.executingUnitId,
      'transport-unit-1',
      givenFiles,
    );

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
    const expectedHydrogenComponents: HydrogenComponentEntity[] = [HydrogenComponentEntityFixture.createRfnboReady()];
    const expectedUnits = [givenUnit];

    const expectedComponentsOverviewDtos = [
      new ComponentsOverviewDto(
        givenUnit.id,
        givenUnit.name,
        givenUnit.unitType,
        0,
        expectedHydrogenComponents,
        givenUnit.active,
      ),
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
      ProcessStepMessagePatterns.READ_ALL_BY_UNIT,
      new ReadProcessStepsByUnitPayload([givenUnit.id], true, givenUserDetails.company.id),
    );
    expect(actualResult).toEqual(expectedComponentsOverviewDtos);
  });

  it('should request the passport by id and map the response when reading a digital product passport', async () => {
    // arrange
    const givenPassportId = 'dpp-1';
    const expectedPassport = new DigitalProductPassportEntity(
      givenPassportId,
      new Date('2025-04-07T16:00:00.000Z'),
      'H2 Logistics',
      10,
      'HydroGen GmbH',
      [HydrogenComponentEntityFixture.createRfnboReady()],
      [DocumentEntityFixture.create()],
      RedComplianceEntityFixture.create(),
      ProofOfSustainabilityEntityFixture.create(),
      [ProofOfOriginSectionEntityFixture.create()],
      PowerType.RENEWABLE,
      RfnboType.RFNBO_READY,
    );
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
