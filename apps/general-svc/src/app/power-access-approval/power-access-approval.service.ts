/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalRepository, UserRepository } from 'libs/database/src/lib';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BrokerException,
  PowerAccessApprovalEntity,
  PowerProductionUnitEntity,
  ReadByIdPayload,
  ReadPowerAccessApprovalsPayload,
  UserEntity,
} from '@h2-trust/amqp';
import { PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';

@Injectable()
export class PowerAccessApprovalService {
  constructor(
    private readonly powerAccessApprovalRepository: PowerAccessApprovalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(payload: ReadPowerAccessApprovalsPayload): Promise<PowerAccessApprovalEntity[]> {
    const user: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerAccessApprovalRepository.findAll(user.company.id, payload.powerAccessApprovalStatus);
  }

  async findApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    const approvals = await this.findAll(
      new ReadPowerAccessApprovalsPayload(payload.id, PowerAccessApprovalStatus.APPROVED),
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
