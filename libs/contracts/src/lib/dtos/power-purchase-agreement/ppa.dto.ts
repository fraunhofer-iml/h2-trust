/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import { EnergySource, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { DecisionDto } from '../decision';
import { PowerProductionOverviewDto } from '../unit';

export class PpaDto {
  id: string;
  hydrogenProducer: CompanyDto;
  powerProducer: CompanyDto;
  powerProductionUnit: PowerProductionOverviewDto;
  status: PowerPurchaseAgreementStatus;
  energySource: EnergySource;
  decision?: DecisionDto;

  constructor(
    id: string,
    hydrogenProducer: CompanyDto,
    powerProducer: CompanyDto,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerPurchaseAgreementStatus,
    energySource: EnergySource,
    decision?: DecisionDto,
  ) {
    this.id = id;
    this.hydrogenProducer = hydrogenProducer;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.energySource = energySource;
    this.decision = decision;
  }

  static fromEntity(powerPurchaseAgreement: PowerPurchaseAgreementEntity): PpaDto {
    return <PpaDto>{
      id: powerPurchaseAgreement.id,
      hydrogenProducer: powerPurchaseAgreement.hydrogenProducer,
      powerProducer: powerPurchaseAgreement.powerProducer,
      powerProductionUnit: PowerProductionOverviewDto.fromEntity(powerPurchaseAgreement.powerProductionUnit),
      status: powerPurchaseAgreement.status,
      energySource: powerPurchaseAgreement.powerProductionUnit.type.energySource,
    };
  }
}
