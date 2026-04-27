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
import { DecisionEntity } from '../decision';
import { DocumentEntity } from '../document';
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
  powerProducer: CompanyEntity;
  hydrogenProducer: CompanyEntity;
  powerProductionUnit?: PowerProductionUnitEntity;
  document?: DocumentEntity;
  decision?: DecisionEntity;

  constructor(
    id: string,
    createdAt: Date,
    validFrom: Date,
    validTo: Date,
    status: PowerPurchaseAgreementStatus,
    powerProducer: CompanyEntity,
    hydrogenProducer: CompanyEntity,
    suggestedPowerProductionTypeName: string,
    creator: UserEntity,
    document?: DocumentEntity,
    powerProductionUnit?: PowerProductionUnitEntity,
    decision?: DecisionEntity,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.status = status;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProducer = hydrogenProducer;
    this.creator = creator;
    this.document = document;
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
      CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.powerProducer),
      CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.hydrogenProducer),
      powerPurchaseAgreement.suggestedPowerTypeName,
      UserEntity.fromDeepDatabase(powerPurchaseAgreement.creatingUser),
      powerPurchaseAgreement.document ? DocumentEntity.fromDatabase(powerPurchaseAgreement.document) : undefined,
      powerPurchaseAgreement.powerProductionUnit
        ? PowerProductionUnitEntity.fromNestedPowerProductionUnit(powerPurchaseAgreement.powerProductionUnit)
        : undefined,
      powerPurchaseAgreement.decision ? DecisionEntity.fromDatabase(powerPurchaseAgreement.decision) : undefined,
    );
  }

  static fromNestedDatabase(agreement: PowerPurchaseAgreementNestedDbType): PowerPurchaseAgreementEntity {
    return <PowerPurchaseAgreementEntity>{
      ...agreement,
      creator: UserEntity.fromDeepDatabase(agreement.creatingUser),
      suggestedPowerProductionTypeName: agreement.suggestedPowerTypeName,
      hydrogenProducer: CompanyEntity.fromFlatDatabase(agreement.hydrogenProducer),
      powerProducer: CompanyEntity.fromFlatDatabase(agreement.powerProducer),
      powerProductionUnit: agreement.powerProductionUnit
        ? PowerProductionUnitEntity.fromNestedPowerProductionUnit(agreement.powerProductionUnit)
        : undefined,
    };
  }
}
