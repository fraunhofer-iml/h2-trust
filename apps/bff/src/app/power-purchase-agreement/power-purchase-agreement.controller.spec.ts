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

  it('should delegate getPpasByStatus to the service when the authenticated user requests agreements by status', async () => {
    // arrange
    const expectedAgreements: PpaDto[] = [PpaDtoFixture.create({ status: PowerPurchaseAgreementStatus.APPROVED })];

    powerPurchaseAgreementServiceMock.readByUserAndStatus.mockResolvedValue(expectedAgreements);

    // act
    const actualResult = await controller.getPpasByStatus(authenticatedUser, PowerPurchaseAgreementStatus.APPROVED);

    // assert
    expect(actualResult).toEqual(expectedAgreements);
    expect(powerPurchaseAgreementServiceMock.readByUserAndStatus).toHaveBeenCalledWith(
      authenticatedUser.sub,
      PowerPurchaseAgreementStatus.APPROVED,
    );
  });

  it('should delegate getPpaRequest to the service when role and optional status are provided', async () => {
    // arrange
    const expectedRequests: PpaRequestDto[] = [PpaRequestDtoFixture.create()];

    powerPurchaseAgreementServiceMock.readAll.mockResolvedValue(expectedRequests);

    // act
    const actualResult = await controller.getPpaRequest(
      controller.getPpaRequest(authenticatedUser, PpaRequestRole.RECEIVER, PowerPurchaseAgreementStatus.PENDING),
    );

    // assert
    expect(actualResult).toEqual(expectedRequests);
    expect(powerPurchaseAgreementServiceMock.readAll).toHaveBeenCalledWith(
      authenticatedUser.sub,
      PpaRequestRole.RECEIVER,
      PowerPurchaseAgreementStatus.PENDING,
    );
  });

  it('should delegate createPpaRequest to the service when the authenticated user submits a request', async () => {
    // arrange
    const givenDto = PpaRequestCreateDtoFixture.create();
    const expectedRequest = PpaRequestDtoFixture.create();

    powerPurchaseAgreementServiceMock.createPPA.mockResolvedValue(expectedRequest);

    // act
    const actualResult = await controller.createPpaRequest(givenDto, authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedRequest);
    expect(powerPurchaseAgreementServiceMock.createPPA).toHaveBeenCalledWith(givenDto, authenticatedUser.sub);
  });

  it('should delegate closePpaRequest to the service when the authenticated user decides a request', async () => {
    // arrange
    const givenDto = PpaRequestDecisionDtoFixture.create();
    const expectedRequest = PpaRequestDtoFixture.createApproved();

    powerPurchaseAgreementServiceMock.updatePPA.mockResolvedValue(expectedRequest);

    // act
    const actualResult = await controller.closePpaRequest(givenDto, 'ppa-request-1', authenticatedUser);

    // assert
    expect(actualResult).toEqual(expectedRequest);
    expect(powerPurchaseAgreementServiceMock.updatePPA).toHaveBeenCalledWith(
      givenDto,
      'ppa-request-1',
      authenticatedUser.sub,
    );
  });
});