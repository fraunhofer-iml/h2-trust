/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { BottlingOverviewDto, DigitalProductPassportDto } from '@h2-trust/contracts/dtos';
import { BottlingDtoFixture, UserDetailsDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { DigitalProductPassportEntity } from '@h2-trust/contracts/entities';
import {
  DocumentEntityFixture,
  HydrogenComponentEntityFixture,
  ProcessStepEntityFixture,
  ProofOfOriginSectionEntityFixture,
  ProofOfSustainabilityEntityFixture,
  RedComplianceEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenBottlingPayload,
  CreateHydrogenTransportationPayload,
  ReadByIdPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { DigitalProductPassportMessagePatterns, ProcessStepMessagePatterns } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';
import { BottlingService } from './bottling.service';

describe('ProcessStepService', () => {
  let service: BottlingService;

  const processSvcMock = {
    send: jest.fn(),
  };

  const userServiceMock = {
    readUserWithCompany: jest.fn(),
  };

  beforeEach(() => {
    service = new BottlingService(processSvcMock as unknown as ClientProxy, userServiceMock as unknown as UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create bottling first and transportation second when both process calls succeed', async () => {
    // arrange
    const givenDto = BottlingDtoFixture.create();
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

    processSvcMock.send
      .mockImplementationOnce((_pattern, _payload) => of(givenPersistedBottling))
      .mockImplementationOnce((_pattern, _payload) => of(expectedPersistedTransportation));

    // act
    const actualResult = await service.createBottlingAndTransportation(givenDto, givenFiles, givenUserId);

    // assert
    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING,
      new CreateHydrogenBottlingPayload(
        givenDto.amount,
        givenDto.recipient,
        new Date(givenDto.filledAt),
        givenUserId,
        givenDto.hydrogenStorageUnit,
        givenDto.rfnboType,
        givenFiles,
      ),
    );
    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION,
      new CreateHydrogenTransportationPayload(
        givenPersistedBottling,
        givenPersistedBottling.batch,
        givenDto.transportMode,
        givenDto.distance,
        givenDto.fuelType,
      ),
    );
    expect(actualResult).toEqual(BottlingOverviewDto.fromEntity(expectedPersistedTransportation));
  });

  it('should reject when transportation creation fails after bottling is created', async () => {
    // arrange
    const givenDto = BottlingDtoFixture.create();
    const givenFiles: Express.Multer.File[] = [];
    const givenUserId = 'user-id-1';
    const givenPersistedBottling = ProcessStepEntityFixture.createHydrogenBottling({
      startedAt: new Date(givenDto.filledAt),
      endedAt: new Date(givenDto.filledAt),
    });

    processSvcMock.send
      .mockImplementationOnce((_pattern, _payload) => of(givenPersistedBottling))
      .mockImplementationOnce((_pattern, _payload) => throwError(() => new Error('transport failed')));

    // act
    const actualResult = service.createBottlingAndTransportation(givenDto, givenFiles, givenUserId);

    // assert
    await expect(actualResult).rejects.toThrow('transport failed');
    expect(processSvcMock.send).toHaveBeenCalledTimes(2);
    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION,
      new CreateHydrogenTransportationPayload(
        givenPersistedBottling,
        givenPersistedBottling.batch,
        givenDto.transportMode,
        givenDto.distance,
        givenDto.fuelType,
      ),
    );
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
    const expectedProcessSteps = [
      ProcessStepEntityFixture.createHydrogenBottling({ id: 'bottling-1' }),
      ProcessStepEntityFixture.createHydrogenTransportation({ id: 'transportation-1' }),
    ];

    userServiceMock.readUserWithCompany.mockResolvedValue(givenUserDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(expectedProcessSteps));

    // act
    const actualResult = await service.readBottlingsAndTransportationsByOwner(givenUserId);

    // assert
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(givenUserId);
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER,
      new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
        true,
        givenUserDetails.company.id,
      ),
    );
    expect(actualResult).toEqual(expectedProcessSteps.map(BottlingOverviewDto.fromEntity));
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
