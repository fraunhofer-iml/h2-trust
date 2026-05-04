/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { PowerProductionUnitEntity, PowerPurchaseAgreementEntity, UserEntity } from '@h2-trust/contracts/entities';
import {
  CreatePowerPurchaseAgreementsPayload,
  ReadByIdPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementRepository, UnitRepository, UserRepository } from '@h2-trust/database';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { BrokerException } from '@h2-trust/messaging';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(
    private readonly powerPurchaseAgreementRepository: PowerPurchaseAgreementRepository,
    private readonly userRepository: UserRepository,
    private readonly unitRepostitory: UnitRepository,
  ) {}

  async findAll(payload: ReadPowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    const user: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerPurchaseAgreementRepository.findAll(
      user.company.id,
      payload.powerPurchaseAgreementStatus,
      payload.powerPurchaseAgreementRole,
    );
  }

  async createPPA(payload: CreatePowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity> {
    const hydrogenProducerCompany: UserEntity = await this.userRepository.findUser(payload.userId);
    return this.powerPurchaseAgreementRepository.create(payload, hydrogenProducerCompany.company.id);
  }

  async updatePPA(payload: UpdatePowerPurchaseAgreementPayload): Promise<PowerPurchaseAgreementEntity> {
    const user: UserEntity = await this.userRepository.findUser(payload.decidingUserId);
    const agreements: PowerPurchaseAgreementEntity[] = await this.powerPurchaseAgreementRepository.findAll(
      user.company.id,
      undefined,
      undefined,
    );
    const hasAccessToAgreement: boolean = agreements.some((agreement) => agreement.id === payload.ppaId);
    if (!hasAccessToAgreement) {
      throw new BrokerException(
        `User ${user.name} is not authorized to update power purchase agreement of this company.`,
        HttpStatus.FORBIDDEN,
      );
    }

    const ownedUnits: PowerProductionUnitEntity[] = await this.unitRepostitory.findPowerProductionUnitsByOwnerId(
      user.company.id,
    );
    const isOwnerOfProductionUnit: boolean = ownedUnits.some((unit) => unit.id === payload.powerProductionUnitId);
    if (!isOwnerOfProductionUnit) {
      throw new BrokerException(
        `User ${user.name} is not authorized to grant access of this power production unit.`,
        HttpStatus.FORBIDDEN,
      );
    }
    return this.powerPurchaseAgreementRepository.updatePpaStatus(payload);
  }

  async findApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    const agreements = await this.findAll(
      new ReadPowerPurchaseAgreementsPayload(payload.id, undefined, PowerPurchaseAgreementStatus.APPROVED),
    );

    const agreementForGrid = agreements.find(
      (agreement) => agreement.powerProductionUnit.type.name === PowerProductionType.GRID,
    );

    if (!agreementForGrid)
      throw new BrokerException(
        `No grid connection found for user with id ${payload.id}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return agreementForGrid.powerProductionUnit;
  }
}
