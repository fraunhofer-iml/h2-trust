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

export class PowerPurchaseAgreementEntity {
  id: string;
  createdAt: Date;
  validFrom: Date;
  validTo: Date;
  status: PowerPurchaseAgreementStatus;
  powerProducer: CompanyEntity;
  powerProductionUnit: PowerProductionUnitEntity;
  hydrogenProducer: CompanyEntity;
  document: DocumentEntity;
  decision?: DecisionEntity;

  constructor(
    id: string,
    createdAt: Date,
    validFrom: Date,
    validTo: Date,
    status: PowerPurchaseAgreementStatus,
    powerProducer: CompanyEntity,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProducer: CompanyEntity,
    document: DocumentEntity,
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
    this.document = document;
    this.decision = decision;
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
      PowerProductionUnitEntity.fromNestedPowerProductionUnit(powerPurchaseAgreement.powerProductionUnit),
      CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.hydrogenProducer),
      DocumentEntity.fromDatabase(powerPurchaseAgreement.document),
      powerPurchaseAgreement.decision ? DecisionEntity.fromDatabase(powerPurchaseAgreement.decision) : undefined,
    );
  }

  static fromNestedDatabase(agreement: PowerPurchaseAgreementNestedDbType): PowerPurchaseAgreementEntity {
    return <PowerPurchaseAgreementEntity>{
      ...agreement,
      hydrogenProducer: CompanyEntity.fromFlatDatabase(agreement.hydrogenProducer),
      powerProducer: CompanyEntity.fromFlatDatabase(agreement.powerProducer),
      powerProductionUnit: PowerProductionUnitEntity.fromNestedPowerProductionUnit(agreement.powerProductionUnit),
    };
  }
}
