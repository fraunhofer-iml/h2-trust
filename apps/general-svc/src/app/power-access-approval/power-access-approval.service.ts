/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalRepository, UserRepository } from 'libs/database/src/lib';
import { Injectable } from '@nestjs/common';
import { PowerAccessApprovalStatus } from '@prisma/client';
import { PowerAccessApprovalEntity, UserEntity } from '@h2-trust/amqp';

@Injectable()
export class PowerAccessApprovalService {
  constructor(
    private readonly powerAccessApprovalRepository: PowerAccessApprovalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(
    userId: string,
    powerAccessApprovalStatus: PowerAccessApprovalStatus,
  ): Promise<PowerAccessApprovalEntity[]> {
    const user: UserEntity = await this.userRepository.findUser(userId);
    return this.powerAccessApprovalRepository.findAll(user.company.id, powerAccessApprovalStatus);
  }
}
