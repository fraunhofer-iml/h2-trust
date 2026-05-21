/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
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

describe('BottlingService', () => {
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

  it('createBottlingAndTransportation should create bottling first and transportation second', async () => {
    const dto = BottlingDtoFixture.create();
    const files: Express.Multer.File[] = [];
    const userId = 'user-id-1';
    const persistedBottling = ProcessStepEntityFixture.createHydrogenBottling({
      startedAt: new Date(dto.filledAt),
      endedAt: new Date(dto.filledAt),
    });
    const persistedTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
      id: 'transportation-1',
      batch: persistedBottling.batch,
    });

    processSvcMock.send
      .mockImplementationOnce((_pattern, _payload) => of(persistedBottling))
      .mockImplementationOnce((_pattern, _payload) => of(persistedTransportation));

    const actualResponse = await service.createBottlingAndTransportation(dto, files, userId);

    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING,
      new CreateHydrogenBottlingPayload(
        dto.amount,
        dto.recipient,
        new Date(dto.filledAt),
        userId,
        dto.hydrogenStorageUnit,
        dto.rfnboType,
        files,
      ),
    );
    expect(processSvcMock.send).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION,
      new CreateHydrogenTransportationPayload(
        persistedBottling,
        persistedBottling.batch,
        dto.transportMode,
        dto.distance,
        dto.fuelType,
      ),
    );
    expect(actualResponse).toEqual(BottlingOverviewDto.fromEntity(persistedTransportation));
  });

  it('readBottlingsAndTransportationsByOwner should resolve the company and request active bottling steps', async () => {
    const userId = 'user-id-1';
    const userDetails = UserDetailsDtoFixture.create({
      company: {
        ...UserDetailsDtoFixture.create().company,
        id: 'company-id-1',
        name: 'Company',
      },
    });
    const processSteps = [
      ProcessStepEntityFixture.createHydrogenBottling({ id: 'bottling-1' }),
      ProcessStepEntityFixture.createHydrogenTransportation({ id: 'transportation-1' }),
    ];

    userServiceMock.readUserWithCompany.mockResolvedValue(userDetails);
    processSvcMock.send.mockImplementation((_pattern, _payload) => of(processSteps));

    const actualResponse = await service.readBottlingsAndTransportationsByOwner(userId);

    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(userId);
    expect(processSvcMock.send).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_OWNER,
      new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
        true,
        userDetails.company.id,
      ),
    );
    expect(actualResponse).toEqual(processSteps.map(BottlingOverviewDto.fromEntity));
  });

  it('readDigitalProductPassport should request the passport by id and map the response', async () => {
    const passportId = 'dpp-1';
    const passport = new DigitalProductPassportEntity(
      passportId,
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

    processSvcMock.send.mockImplementation((_pattern, _payload) => of(passport));

    const actualResponse: DigitalProductPassportDto = await service.readDigitalProductPassport(passportId);

    expect(processSvcMock.send).toHaveBeenCalledWith(
      DigitalProductPassportMessagePatterns.READ,
      new ReadByIdPayload(passportId),
    );
    expect(actualResponse).toEqual(DigitalProductPassportDto.fromEntity(passport));
  });
});