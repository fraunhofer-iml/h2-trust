/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/amqp';
import { EnergySource, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';

export class PowerPurchaseAgreementDto {
  id: string;
  hydrogenProducer: CompanyDto;
  powerProducer: CompanyDto;
  powerProductionUnit: PowerProductionOverviewDto;
  status: PowerPurchaseAgreementStatus;
  energySource: EnergySource;

  constructor(
    id: string,
    hydrogenProducer: CompanyDto,
    powerProducer: CompanyDto,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerPurchaseAgreementStatus,
    energySource: EnergySource,
  ) {
    this.id = id;
    this.hydrogenProducer = hydrogenProducer;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.energySource = energySource;
  }

  static fromEntity(powerPurchaseAgreement: PowerPurchaseAgreementEntity): PowerPurchaseAgreementDto {
    return <PowerPurchaseAgreementDto>{
      id: powerPurchaseAgreement.id,
      hydrogenProducer: powerPurchaseAgreement.hydrogenProducer,
      powerProducer: powerPurchaseAgreement.powerProducer,
      powerProductionUnit: PowerProductionOverviewDto.fromEntity(powerPurchaseAgreement.powerProductionUnit),
      status: powerPurchaseAgreement.status,
      energySource: powerPurchaseAgreement.powerProductionUnit.type.energySource,
    };
  }
}
