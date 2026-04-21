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
import {
  BrokerQueues,
  PowerPurchaseAgreementPatterns,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/amqp';
import { PowerPurchaseAgreementDto, PpaRequestDecisionDto, PpaRequestDto, UserDetailsDto } from '@h2-trust/api';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly userService: UserService,
  ) {}

  /*   async readByUserAndStatus(
    userId: string,
    status: PowerPurchaseAgreementStatus,
  ): Promise<PowerPurchaseAgreementDto[]> {
    const payload = new ReadPowerPurchaseAgreementsPayload(userId, status);

    const powerPurchaseAgreements = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.READ, payload),
    );
    return powerPurchaseAgreements.map(PowerPurchaseAgreementDto.fromEntity);
  } */

  async readAll(userId: string, role: PpaRequestRole, status?: PowerPurchaseAgreementStatus): Promise<PpaRequestDto[]> {
    const payload = new ReadPowerPurchaseAgreementsPayload(userId, role, status);
    const powerPurchaseAgreements = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.READ, payload),
    );
    return powerPurchaseAgreements.map(PowerPurchaseAgreementDto.fromEntity);
  }

  /* async createPPA(dto: PpaRequestCreateDto, userId: string): Promise<PpaRequestDto> {
    const payload = new CreatePowerPurchaseAgreementsPayload(
      dto.companyId,
      dto.powerProductionType,
      dto.validFrom,
      dto.validTo,
    );

    const powerPurchaseAgreement = await firstValueFrom(
      this.generalService.send(PowerPurchaseAgreementPatterns.CREATE, payload),
    );

    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    return PpaRequestDto.fromEntity(powerPurchaseAgreement, userDetails);
  } */

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

    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    return PpaRequestDto.fromEntity(powerPurchaseAgreement, userDetails);
  }
}
