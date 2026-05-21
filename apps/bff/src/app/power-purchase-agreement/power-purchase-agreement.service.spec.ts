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
import {
  PpaRequestCreateDtoFixture,
  PpaRequestDecisionDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
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

  it('readByUserAndStatus should send the filtered payload and map the response', async () => {
    const userId = 'user-id-1';
    const status = PowerPurchaseAgreementStatus.APPROVED;
    const agreements = [PowerPurchaseAgreementEntityFixture.create({ id: 'ppa-1', status })];

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(agreements));

    const actualResponse = await service.readByUserAndStatus(userId, status);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.READ,
      new ReadPowerPurchaseAgreementsPayload(userId, undefined, status),
    );
    expect(actualResponse).toEqual(agreements.map(PpaDto.fromEntity));
  });

  it('readAll should include role and optional status in the request payload', async () => {
    const userId = 'user-id-1';
    const role = PpaRequestRole.RECEIVER;
    const status = PowerPurchaseAgreementStatus.PENDING;
    const agreements = [PowerPurchaseAgreementEntityFixture.create({ id: 'ppa-request-1', status })];

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(agreements));

    const actualResponse = await service.readAll(userId, role, status);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.READ,
      new ReadPowerPurchaseAgreementsPayload(userId, role, status),
    );
    expect(actualResponse).toEqual(agreements.map(PpaRequestDto.fromEntity));
  });

  it('createPPA should build the create payload from the dto and requesting user', async () => {
    const userId = 'user-id-1';
    const dto = PpaRequestCreateDtoFixture.create();
    const agreement = PowerPurchaseAgreementEntityFixture.create({
      id: 'created-ppa-1',
      requestedCompany: PowerPurchaseAgreementEntityFixture.create().requestedCompany,
      status: PowerPurchaseAgreementStatus.PENDING,
    });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(agreement));

    const actualResponse = await service.createPPA(dto, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.CREATE,
      new CreatePowerPurchaseAgreementsPayload(dto.companyId, dto.powerProductionType, dto.validFrom, dto.validTo, userId),
    );
    expect(actualResponse).toEqual(PpaRequestDto.fromEntity(agreement));
  });

  it('updatePPA should send the decision payload and map the updated request', async () => {
    const userId = 'user-id-1';
    const ppaId = 'ppa-id-1';
    const dto = PpaRequestDecisionDtoFixture.create();
    const agreement = PowerPurchaseAgreementEntityFixture.create({ id: ppaId, status: dto.decision });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(agreement));

    const actualResponse = await service.updatePPA(dto, ppaId, userId);

    expect(generalServiceMock.send).toHaveBeenCalledWith(
      PowerPurchaseAgreementPatterns.UPDATE,
      new UpdatePowerPurchaseAgreementPayload(ppaId, dto.decision, userId, dto.powerProductionUnitId, dto.comment),
    );
    expect(actualResponse).toEqual(PpaRequestDto.fromEntity(agreement));
  });
});