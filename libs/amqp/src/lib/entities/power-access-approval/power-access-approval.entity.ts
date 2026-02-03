/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalDeepDbType, PowerAccessApprovalShallowType } from '@h2-trust/database';
import { CompanyEntity } from '../company';
import { DocumentEntity } from '../document';
import { BaseUnitEntity, PowerProductionUnitEntity } from '../unit';

export class PowerAccessApprovalEntity {
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

  static fromShallowDatabase(approval: PowerAccessApprovalShallowType): PowerAccessApprovalEntity {
    return <PowerAccessApprovalEntity>{
      ...approval,
      hydrogenProducer: CompanyEntity.fromSurfaceDatabase(approval.hydrogenProducer),
      powerProducer: CompanyEntity.fromSurfaceDatabase(approval.powerProducer),
      powerProductionUnit: PowerProductionUnitEntity.fromSurfaceDatabaseAsRef(approval.powerProductionUnit),
    };
  }

  static fromDeepDatabase(powerAccessApproval: PowerAccessApprovalDeepDbType): PowerAccessApprovalEntity {
    return <PowerAccessApprovalEntity>{
      id: powerAccessApproval.id,
      decidedAt: powerAccessApproval.decidedAt,
      status: powerAccessApproval.status,
      powerProducer: CompanyEntity.fromShallowDatabase(powerAccessApproval.powerProducer),
      powerProductionUnit: {
        ...BaseUnitEntity.fromShallowDatabase(powerAccessApproval.powerProductionUnit.generalInfo),
        ratedPower: powerAccessApproval.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
        gridOperator: powerAccessApproval.powerProductionUnit?.gridOperator,
        gridLevel: powerAccessApproval.powerProductionUnit?.gridLevel,
        gridConnectionNumber: powerAccessApproval.powerProductionUnit?.gridConnectionNumber,
        type: powerAccessApproval.powerProductionUnit?.type,
      },
      hydrogenProducer: CompanyEntity.fromShallowDatabase(powerAccessApproval.hydrogenProducer),
      document: DocumentEntity.fromDatabase(powerAccessApproval.document),
    };
  }
}
