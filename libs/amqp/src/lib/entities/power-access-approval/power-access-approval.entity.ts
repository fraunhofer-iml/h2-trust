/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementDeepDbType, PowerPurchaseAgreementNestedDbType } from '@h2-trust/database';
import { CompanyEntity } from '../company';
import { DocumentEntity } from '../document';
import { PowerProductionUnitEntity } from '../unit';

export class PowerPurchaseAgreementEntity {
  id: string;
  decidedAt: Date;
  status: string;
  powerProducer: CompanyEntity;
  powerProductionUnit: PowerProductionUnitEntity;
  hydrogenProducer: CompanyEntity;
  document: DocumentEntity;

  constructor(
    id: string,
    decidedAt: Date,
    status: string,
    powerProducer: CompanyEntity,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProducer: CompanyEntity,
    document: DocumentEntity,
  ) {
    this.id = id;
    this.decidedAt = decidedAt;
    this.status = status;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProducer = hydrogenProducer;
    this.document = document;
  }

  static fromDeepDatabase(powerPurchaseAgreement: PowerPurchaseAgreementDeepDbType): PowerPurchaseAgreementEntity {
    return <PowerPurchaseAgreementEntity>{
      id: powerPurchaseAgreement.id,
      decidedAt: powerPurchaseAgreement.decidedAt,
      status: powerPurchaseAgreement.status,
      powerProducer: CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.powerProducer),
      powerProductionUnit: PowerProductionUnitEntity.fromNestedPowerProductionUnit(
        powerPurchaseAgreement.powerProductionUnit,
      ),
      hydrogenProducer: CompanyEntity.fromNestedDatabase(powerPurchaseAgreement.hydrogenProducer),
      document: DocumentEntity.fromDatabase(powerPurchaseAgreement.document),
    };
  }

  static fromNestedDatabase(approval: PowerPurchaseAgreementNestedDbType): PowerPurchaseAgreementEntity {
    return <PowerPurchaseAgreementEntity>{
      ...approval,
      hydrogenProducer: CompanyEntity.fromFlatDatabase(approval.hydrogenProducer),
      powerProducer: CompanyEntity.fromFlatDatabase(approval.powerProducer),
      powerProductionUnit: PowerProductionUnitEntity.fromNestedPowerProductionUnit(approval.powerProductionUnit),
    };
  }
}
