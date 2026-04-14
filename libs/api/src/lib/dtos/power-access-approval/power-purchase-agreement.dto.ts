/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/amqp';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';

export class PowerPurchaseAgreementDto {
  id: string;
  hydrogenProducer: CompanyDto;
  powerProducer: CompanyDto;
  powerProductionUnit: PowerProductionOverviewDto;
  status: PowerPurchaseAgreementStatus;
  energySource: string;

  constructor(
    id: string,
    hydrogenProducer: CompanyDto,
    powerProducer: CompanyDto,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerPurchaseAgreementStatus,
    energySource: string,
  ) {
    this.id = id;
    this.hydrogenProducer = hydrogenProducer;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.energySource = energySource;
  }

  static fromEntity(powerAccessApproval: PowerPurchaseAgreementEntity): PowerPurchaseAgreementDto {
    return <PowerPurchaseAgreementDto>{
      id: powerAccessApproval.id,
      hydrogenProducer: powerAccessApproval.hydrogenProducer,
      powerProducer: powerAccessApproval.powerProducer,
      powerProductionUnit: PowerProductionOverviewDto.fromEntity(powerAccessApproval.powerProductionUnit),
      status: powerAccessApproval.status,
      energySource: powerAccessApproval.powerProductionUnit.type?.name,
    };
  }
}
