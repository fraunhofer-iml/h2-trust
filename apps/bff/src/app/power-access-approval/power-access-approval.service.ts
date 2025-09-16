/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, PowerAccessApprovalPattern } from '@h2-trust/amqp';
import { PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';

@Injectable()
export class PowerAccessApprovalService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async findAll(
    userId: string,
    powerAccessApprovalStatus: PowerAccessApprovalStatus,
  ): Promise<PowerAccessApprovalDto[]> {
    return firstValueFrom(
      this.generalService.send(PowerAccessApprovalPattern.READ, { userId, powerAccessApprovalStatus }),
    ).then((entities) => entities.map(PowerAccessApprovalDto.fromEntity));
  }
}
