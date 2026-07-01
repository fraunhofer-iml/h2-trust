/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { PowerPurchaseAgreementEntity, UnitEntity, UserEntity } from '@h2-trust/contracts/entities';
import {
  CreatePowerPurchaseAgreementsPayload,
  ReadByIdPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementRepository, UnitRepository, UserRepository } from '@h2-trust/database';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { DomainException, ErrorCode, ValidationException } from '@h2-trust/exceptions';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(
    private readonly powerPurchaseAgreementRepository: PowerPurchaseAgreementRepository,
    private readonly userRepository: UserRepository,
    private readonly unitRepository: UnitRepository,
  ) {}

  async findAll(payload: ReadPowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    const user: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerPurchaseAgreementRepository.findAllPowerPurchaseAgreements(
      user.company.id,
      payload.powerPurchaseAgreementStatus,
      payload.powerPurchaseAgreementRole,
    );
  }

  async createPPA(payload: CreatePowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity> {
    if (payload.validFrom >= payload.validTo) {
      throw new ValidationException('validFrom must be before validTo');
    }
    const hydrogenProducerCompany: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerPurchaseAgreementRepository.createPowerPurchaseAgreement(
      payload,
      hydrogenProducerCompany.company.id,
    );
  }

  async updatePPA(payload: UpdatePowerPurchaseAgreementPayload): Promise<PowerPurchaseAgreementEntity> {
    const user: UserEntity = await this.userRepository.findUser(payload.decidingUserId);

    await this.checkUserAccessToPowerPurchaseAgreement(user, payload.ppaId);
    if (payload.powerProductionUnitId) {
      await this.hasUserOwnershipOverPowerProductionUnit(user, payload.powerProductionUnitId);
    }

    return this.powerPurchaseAgreementRepository.updatePpaStatus(payload);
  }

  async findApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<UnitEntity> {
    const agreements = await this.findAll(
      new ReadPowerPurchaseAgreementsPayload(payload.id, undefined, PowerPurchaseAgreementStatus.APPROVED),
    );

    const agreementForGrid = agreements.find(
      (agreement) => agreement.powerProductionUnit?.details?.type === PowerProductionType.GRID,
    );

    if (!agreementForGrid) {
      throw new DomainException(
        ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        `No grid connection found for user with id ${payload.id}.`,
      );
    }

    return agreementForGrid.powerProductionUnit;
  }

  private async checkUserAccessToPowerPurchaseAgreement(user: UserEntity, ppaId: string) {
    const hasAccessToAgreement: boolean = await this.powerPurchaseAgreementRepository.canDecideAgreement(user, ppaId);
    if (!hasAccessToAgreement) {
      throw new DomainException(
        ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        `User ${user.name} is not authorized to update power purchase agreement of this company.`,
      );
    }
  }

  private async hasUserOwnershipOverPowerProductionUnit(user: UserEntity, powerProductionUnitId: string) {
    const isOwnerOfProductionUnit: boolean = await this.unitRepository.ownsPowerProductionUnit(
      user,
      powerProductionUnitId,
    );
    if (!isOwnerOfProductionUnit) {
      throw new DomainException(
        ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        `User ${user.name} is not authorized to grant access of this power production unit.`,
      );
    }
  }
}
