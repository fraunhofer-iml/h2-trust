/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PowerAccessApprovalDto } from '@h2-trust/contracts/dtos';
import { ReadPowerAccessApprovalsPayload } from '@h2-trust/contracts/payloads';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { BrokerQueues, PowerAccessApprovalMessagePatterns } from '@h2-trust/messaging';

@Injectable()
export class PowerAccessApprovalService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async readByUserAndStatus(userId: string, status: PowerAccessApprovalStatus): Promise<PowerAccessApprovalDto[]> {
    const payload = new ReadPowerAccessApprovalsPayload(userId, status);

    const powerAccessApprovals = await firstValueFrom(
      this.generalService.send(PowerAccessApprovalMessagePatterns.READ, payload),
    );
    return powerAccessApprovals.map(PowerAccessApprovalDto.fromEntity);
  }
}
