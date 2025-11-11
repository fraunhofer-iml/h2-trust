/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalDbType } from 'libs/database/src/lib';
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

  static fromDatabase(powerAccessApproval: PowerAccessApprovalDbType): PowerAccessApprovalEntity {
    return <PowerAccessApprovalEntity>{
      id: powerAccessApproval.id,
      decidedAt: powerAccessApproval.decidedAt,
      status: powerAccessApproval.status,
      powerProducer: CompanyEntity.fromDatabase(powerAccessApproval.powerProducer),
      powerProductionUnit: {
        ...BaseUnitEntity.fromDatabase(powerAccessApproval.powerProductionUnit.generalInfo),
        ratedPower: powerAccessApproval.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
        gridOperator: powerAccessApproval.powerProductionUnit?.gridOperator,
        gridLevel: powerAccessApproval.powerProductionUnit?.gridLevel,
        gridConnectionNumber: powerAccessApproval.powerProductionUnit?.gridConnectionNumber,
        typeName: powerAccessApproval.powerProductionUnit?.type.name,
      },
      hydrogenProducer: CompanyEntity.fromDatabase(powerAccessApproval.hydrogenProducer),
      document: DocumentEntity.fromDatabase(powerAccessApproval.document),
    };
  }
}