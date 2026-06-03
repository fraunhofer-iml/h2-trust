/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';

export class HydrogenProductionOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  ratedPower: number;
  technology: HydrogenProductionTechnology;
  powerPurchaseAgreementStatus: boolean;
  powerProducerId: string;
  powerProducerName: string;
  active: boolean;

  constructor(
    id: string,
    name: string,
    unitType: UnitType,
    ratedPower: number,
    technology: HydrogenProductionTechnology,
    powerPurchaseAgreementStatus: boolean,
    powerProducerId: string,
    powerProducerName: string,
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.ratedPower = ratedPower;
    this.technology = technology;
    this.powerPurchaseAgreementStatus = powerPurchaseAgreementStatus;
    this.powerProducerId = powerProducerId;
    this.powerProducerName = powerProducerName;
    this.active = active;
  }

  static fromEntity(unit: UnitEntity): HydrogenProductionOverviewDto {
    const firstAgreement = unit.owner?.hydrogenAgreements?.[0];

    return {
      id: unit.id,
      name: unit.name,
      unitType: UnitType.HYDROGEN_PRODUCTION,
      ratedPower: unit.specification.ratedPower ?? 0,
      technology: unit.specification.technology!,
      powerPurchaseAgreementStatus: HydrogenProductionOverviewDto.existsPowerProducer(unit),
      powerProducerId: firstAgreement?.requestedCompany.id ?? '',
      powerProducerName: firstAgreement?.requestedCompany.name ?? '',
      active: unit.active,
    };
  }

  private static existsPowerProducer(unit: UnitEntity) {
    return unit.owner?.hydrogenAgreements?.length ? unit.owner.hydrogenAgreements.length !== 0 : false;
  }
}
