/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type AuthenticatedKCUser,
  type PpaDto,
  type PpaRequestDto,
} from '@h2-trust/contracts/dtos';
import {
  PpaDtoFixture,
  PpaRequestCreateDtoFixture,
  PpaRequestDecisionDtoFixture,
  PpaRequestDtoFixture,
} from '@h2-trust/contracts/dtos/fixtures';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

describe('PowerPurchaseAgreementController', () => {
  let controller: PowerPurchaseAgreementController;

  const powerPurchaseAgreementServiceMock = {
    readByUserAndStatus: jest.fn(),
    readAll: jest.fn(),
    createPPA: jest.fn(),
    updatePPA: jest.fn(),
  };

  const authenticatedUser = { sub: 'user-id-1' } as AuthenticatedKCUser;

  beforeEach(() => {
    controller = new PowerPurchaseAgreementController(
      powerPurchaseAgreementServiceMock as unknown as PowerPurchaseAgreementService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates getPpasByStatus to the service with the authenticated user id', async () => {
    const agreements: PpaDto[] = [PpaDtoFixture.create({ status: PowerPurchaseAgreementStatus.APPROVED })];

    powerPurchaseAgreementServiceMock.readByUserAndStatus.mockResolvedValue(agreements);

    await expect(
      controller.getPpasByStatus(authenticatedUser, PowerPurchaseAgreementStatus.APPROVED),
    ).resolves.toEqual(agreements);
    expect(powerPurchaseAgreementServiceMock.readByUserAndStatus).toHaveBeenCalledWith(
      authenticatedUser.sub,
      PowerPurchaseAgreementStatus.APPROVED,
    );
  });

  it('delegates getPpaRequest to the service with role and optional status', async () => {
    const requests: PpaRequestDto[] = [PpaRequestDtoFixture.create()];

    powerPurchaseAgreementServiceMock.readAll.mockResolvedValue(requests);

    await expect(
      controller.getPpaRequest(authenticatedUser, PpaRequestRole.RECEIVER, PowerPurchaseAgreementStatus.PENDING),
    ).resolves.toEqual(requests);
    expect(powerPurchaseAgreementServiceMock.readAll).toHaveBeenCalledWith(
      authenticatedUser.sub,
      PpaRequestRole.RECEIVER,
      PowerPurchaseAgreementStatus.PENDING,
    );
  });

  it('delegates createPpaRequest to the service with the authenticated user id', async () => {
    const dto = PpaRequestCreateDtoFixture.create();
    const request = PpaRequestDtoFixture.create();

    powerPurchaseAgreementServiceMock.createPPA.mockResolvedValue(request);

    await expect(controller.createPpaRequest(dto, authenticatedUser)).resolves.toEqual(request);
    expect(powerPurchaseAgreementServiceMock.createPPA).toHaveBeenCalledWith(dto, authenticatedUser.sub);
  });

  it('delegates closePpaRequest to the service with the request id and authenticated user id', async () => {
    const dto = PpaRequestDecisionDtoFixture.create();
    const request = PpaRequestDtoFixture.createApproved();

    powerPurchaseAgreementServiceMock.updatePPA.mockResolvedValue(request);

    await expect(controller.closePpaRequest(dto, 'ppa-request-1', authenticatedUser)).resolves.toEqual(request);
    expect(powerPurchaseAgreementServiceMock.updatePPA).toHaveBeenCalledWith(
      dto,
      'ppa-request-1',
      authenticatedUser.sub,
    );
  });
});