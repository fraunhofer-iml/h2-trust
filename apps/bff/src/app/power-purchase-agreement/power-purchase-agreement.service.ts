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
import { PowerPurchaseAgreementDto } from '@h2-trust/contracts/dtos';
import { ReadPowerPurchaseAgreementsPayload } from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { BrokerQueues, PowerPurchaseAgreementPatterns } from '@h2-trust/messaging';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async readByUserAndStatus(
    userId: string,
    status: PowerPurchaseAgreementStatus,
  ): Promise<PowerPurchaseAgreementDto[]> {
    const payload = new ReadPowerPurchaseAgreementsPayload(userId, status);

    const powerPurchaseAgreements = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.READ, payload),
    );
    return powerPurchaseAgreements.map(PowerPurchaseAgreementDto.fromEntity);
  }
}
