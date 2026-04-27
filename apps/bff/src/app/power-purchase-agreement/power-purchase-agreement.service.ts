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
import { PpaRequestCreateDto, PpaRequestDecisionDto, PpaRequestDto } from '@h2-trust/contracts/dtos';
import {
  CreatePowerPurchaseAgreementsPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { BrokerQueues, PowerPurchaseAgreementPatterns } from '@h2-trust/messaging';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  /* async readByUserAndStatus(userId: string, status: PowerPurchaseAgreementStatus): Promise<PpaDto[]> {
    const payload = new ReadPowerPurchaseAgreementsPayload(userId, status);

    const powerPurchaseAgreements = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.READ, payload),
    );
    return powerPurchaseAgreements.map(PpaDto.fromEntity);
  } */

  async readAll(userId: string, role: PpaRequestRole, status?: PowerPurchaseAgreementStatus): Promise<PpaRequestDto[]> {
    const payload = new ReadPowerPurchaseAgreementsPayload(userId, role, status);
    const powerPurchaseAgreements = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.READ, payload),
    );
    return powerPurchaseAgreements.map(PpaRequestDto.fromEntity);
  }

  async createPPA(dto: PpaRequestCreateDto, userId: string): Promise<PpaRequestDto> {
    const payload = new CreatePowerPurchaseAgreementsPayload(
      dto.companyId,
      dto.powerProductionType,
      dto.validFrom,
      dto.validTo,
      userId,
    );

    const powerPurchaseAgreement = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.CREATE, payload),
    );

    return PpaRequestDto.fromEntity(powerPurchaseAgreement);
  }

  async updatePPA(
    dto: PpaRequestDecisionDto,
    powerPurchaseAgreementRequestId: string,
    userId: string,
  ): Promise<PpaRequestDto> {
    const payload = new UpdatePowerPurchaseAgreementPayload(
      powerPurchaseAgreementRequestId,
      dto.decision,
      userId,
      dto.powerProductionUnitId,
      dto.comment,
    );

    const powerPurchaseAgreement = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.UPDATE, payload),
    );

    return PpaRequestDto.fromEntity(powerPurchaseAgreement);
  }
}
