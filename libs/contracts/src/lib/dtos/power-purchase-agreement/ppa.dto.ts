/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';

export class PpaDto {
  id: string;
  hydrogenProducer: CompanyDto;
  powerProducer: CompanyDto;
  status: PowerPurchaseAgreementStatus;
  powerProductionType: PowerProductionType;
  powerProductionUnit?: PowerProductionOverviewDto;

  constructor(
    id: string,
    hydrogenProducer: CompanyDto,
    powerProducer: CompanyDto,
    status: PowerPurchaseAgreementStatus,
    powerProductionType: PowerProductionType,
    powerProductionUnit?: PowerProductionOverviewDto,
  ) {
    this.id = id;
    this.hydrogenProducer = hydrogenProducer;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.powerProductionType = powerProductionType;
  }

  static fromEntity(powerPurchaseAgreement: PowerPurchaseAgreementEntity): PpaDto {
    return <PpaDto>{
      id: powerPurchaseAgreement.id,
      hydrogenProducer: powerPurchaseAgreement.hydrogenProducer,
      powerProducer: powerPurchaseAgreement.requestedCompany,
      powerProductionUnit: powerPurchaseAgreement.powerProductionUnit
        ? PowerProductionOverviewDto.fromEntity(powerPurchaseAgreement.powerProductionUnit)
        : undefined,
      status: powerPurchaseAgreement.status,
      powerProductionType: powerPurchaseAgreement.powerProductionUnit
        ? powerPurchaseAgreement.powerProductionUnit.details.type
        : undefined,
    };
  }
}
