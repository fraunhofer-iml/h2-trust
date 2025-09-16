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
import { PowerAccessApprovalEntity, UserDetailsEntity } from '@h2-trust/amqp';

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
    const userWithCompany: UserDetailsEntity = await this.userRepository.findUserWithCompany(userId);
    return this.powerAccessApprovalRepository.findAll(userWithCompany.company.id, powerAccessApprovalStatus);
  }
}
