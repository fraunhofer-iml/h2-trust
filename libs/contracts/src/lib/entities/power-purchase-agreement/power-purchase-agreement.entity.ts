/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementDeepDbType, PowerPurchaseAgreementNestedDbType } from '@h2-trust/database';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { CompanyEntity } from '../company';
import { PowerPurchaseAgreementDecisionEntity } from '../power-purchase-agreement-decision';
import { PowerProductionUnitEntity } from '../unit';
import { UserEntity } from '../user';

export class PowerPurchaseAgreementEntity {
  id: string;
  createdAt: Date;
  validFrom: Date;
  validTo: Date;
  status: PowerPurchaseAgreementStatus;
  suggestedPowerProductionTypeName: string;
  creator: UserEntity;
  requestedCompany: CompanyEntity;
  hydrogenProducer: CompanyEntity;
  powerProductionUnit?: PowerProductionUnitEntity;
  decision?: PowerPurchaseAgreementDecisionEntity;

  constructor(
    id: string,
    createdAt: Date,
    validFrom: Date,
    validTo: Date,
    status: PowerPurchaseAgreementStatus,
    requestedCompany: CompanyEntity,
    hydrogenProducer: CompanyEntity,
    suggestedPowerProductionTypeName: string,
    creator: UserEntity,
    powerProductionUnit?: PowerProductionUnitEntity,
    decision?: PowerPurchaseAgreementDecisionEntity,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.status = status;
    this.requestedCompany = requestedCompany;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProducer = hydrogenProducer;
    this.creator = creator;
    this.decision = decision;
    this.suggestedPowerProductionTypeName = suggestedPowerProductionTypeName;
  }

  static fromDeepDatabase(powerPurchaseAgreement: PowerPurchaseAgreementDeepDbType): PowerPurchaseAgreementEntity {
    assertValidEnum(powerPurchaseAgreement.status, PowerPurchaseAgreementStatus, 'PowerPurchaseAgreementStatus');

    return new PowerPurchaseAgreementEntity(
      powerPurchaseAgreement.id,
      powerPurchaseAgreement.createdAt,
      powerPurchaseAgreement.validFrom,
      powerPurchaseAgreement.validTo,
      powerPurchaseAgreement.status,
      CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.requestedCompany),
      CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.hydrogenProducer),
      powerPurchaseAgreement.suggestedPowerTypeName,
      UserEntity.fromDeepDatabase(powerPurchaseAgreement.requestingUser),
      powerPurchaseAgreement.powerProductionUnit
        ? PowerProductionUnitEntity.fromNestedPowerProductionUnit(powerPurchaseAgreement.powerProductionUnit)
        : undefined,
      powerPurchaseAgreement.decision
        ? PowerPurchaseAgreementDecisionEntity.fromDatabase(powerPurchaseAgreement.decision)
        : undefined,
    );
  }

  static fromNestedDatabase(powerPurchaseAgreement: PowerPurchaseAgreementNestedDbType): PowerPurchaseAgreementEntity {
    assertValidEnum(powerPurchaseAgreement.status, PowerPurchaseAgreementStatus, 'PowerPurchaseAgreementStatus');

    return new PowerPurchaseAgreementEntity(
      powerPurchaseAgreement.id,
      powerPurchaseAgreement.createdAt,
      powerPurchaseAgreement.validFrom,
      powerPurchaseAgreement.validTo,
      powerPurchaseAgreement.status,
      CompanyEntity.fromFlatDatabase(powerPurchaseAgreement.requestedCompany),
      CompanyEntity.fromFlatDatabase(powerPurchaseAgreement.hydrogenProducer),
      powerPurchaseAgreement.suggestedPowerTypeName,
      UserEntity.fromDeepDatabase(powerPurchaseAgreement.requestingUser),
      powerPurchaseAgreement.powerProductionUnit
        ? PowerProductionUnitEntity.fromNestedPowerProductionUnit(powerPurchaseAgreement.powerProductionUnit)
        : undefined,
    );
  }
}
