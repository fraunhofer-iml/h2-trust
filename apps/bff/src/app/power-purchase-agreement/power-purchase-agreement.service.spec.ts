/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { PpaDto, PpaRequestDto } from '@h2-trust/contracts/dtos';
import { PpaRequestCreateDtoFixture, PpaRequestDecisionDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { PowerPurchaseAgreementEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import {
  CreatePowerPurchaseAgreementsPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerPurchaseAgreementPatterns } from '@h2-trust/messaging';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

describe('PowerPurchaseAgreementService', () => {
  let service: PowerPurchaseAgreementService;

  const generalServiceMock = {
    send: jest.fn(),
  };

  beforeEach(() => {
    service = new PowerPurchaseAgreementService(generalServiceMock as unknown as ClientProxy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send the filtered payload and map the response when reading agreements by user and status', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenStatus = PowerPurchaseAgreementStatus.APPROVED;
    const expectedAgreements = [PowerPurchaseAgreementEntityFixture.create({ id: 'ppa-1', status: givenStatus })];

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedAgreements));

    // act
    const actualResult = await service.readByUserAndStatus(givenUserId, givenStatus);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.READ,
      new ReadPowerPurchaseAgreementsPayload(givenUserId, undefined, givenStatus),
    );
    expect(actualResult).toEqual(expectedAgreements.map(PpaDto.fromEntity));
  });

  it('should include role and optional status in the request payload when reading all PPA requests', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenRole = PpaRequestRole.RECEIVER;
    const givenStatus = PowerPurchaseAgreementStatus.PENDING;
    const expectedAgreements = [
      PowerPurchaseAgreementEntityFixture.create({ id: 'ppa-request-1', status: givenStatus }),
    ];

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedAgreements));

    // act
    const actualResult = await service.readAll(givenUserId, givenRole, givenStatus);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.READ,
      new ReadPowerPurchaseAgreementsPayload(givenUserId, givenRole, givenStatus),
    );
    expect(actualResult).toEqual(expectedAgreements.map(PpaRequestDto.fromEntity));
  });

  it('should build the create payload from the DTO when creating a PPA request', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenDto = PpaRequestCreateDtoFixture.create();
    const expectedAgreement = PowerPurchaseAgreementEntityFixture.create({
      id: 'created-ppa-1',
      requestedCompany: PowerPurchaseAgreementEntityFixture.create().requestedCompany,
      status: PowerPurchaseAgreementStatus.PENDING,
    });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedAgreement));

    // act
    const actualResult = await service.createPPA(givenDto, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.CREATE,
      new CreatePowerPurchaseAgreementsPayload(
        givenDto.companyId,
        givenDto.powerProductionType,
        givenDto.validFrom,
        givenDto.validTo,
        givenUserId,
      ),
    );
    expect(actualResult).toEqual(PpaRequestDto.fromEntity(expectedAgreement));
  });

  it('should send the decision payload and map the updated request when updating a PPA request', async () => {
    // arrange
    const givenUserId = 'user-id-1';
    const givenPpaId = 'ppa-id-1';
    const givenDto = PpaRequestDecisionDtoFixture.create();
    const expectedAgreement = PowerPurchaseAgreementEntityFixture.create({ id: givenPpaId, status: givenDto.decision });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedAgreement));

    // act
    const actualResult = await service.updatePPA(givenDto, givenPpaId, givenUserId);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.UPDATE,
      new UpdatePowerPurchaseAgreementPayload(
        givenPpaId,
        givenDto.decision,
        givenUserId,
        givenDto.powerProductionUnitId,
        givenDto.comment,
      ),
    );
    expect(actualResult).toEqual(PpaRequestDto.fromEntity(expectedAgreement));
  });
});
