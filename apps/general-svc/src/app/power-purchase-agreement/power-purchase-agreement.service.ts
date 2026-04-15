/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementRepository, UserRepository } from 'libs/database/src/lib';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BrokerException,
  PowerProductionUnitEntity,
  PowerPurchaseAgreementEntity,
  ReadByIdPayload,
  ReadPowerPurchaseAgreementsPayload,
  UserEntity,
} from '@h2-trust/amqp';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(
    private readonly powerPurchaseAgreementRepository: PowerPurchaseAgreementRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(payload: ReadPowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    const user: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerPurchaseAgreementRepository.findAll(user.company.id, payload.powerPurchaseAgreementStatus);
  }

  async findApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    const approvals = await this.findAll(
      new ReadPowerPurchaseAgreementsPayload(payload.id, PowerPurchaseAgreementStatus.APPROVED),
    );

    const approvalForGrid = approvals.find(
      (approval) => approval.powerProductionUnit.type.name === PowerProductionType.GRID,
    );

    if (!approvalForGrid)
      throw new BrokerException(
        `No grid connection found for user with id ${payload.id}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return approvalForGrid.powerProductionUnit;
  }
}
