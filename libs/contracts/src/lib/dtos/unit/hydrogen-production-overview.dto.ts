/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/contracts';
import { HydrogenProductionTechnology } from '@h2-trust/domain';

export class HydrogenProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  technology: HydrogenProductionTechnology;
  producing: boolean;
  powerAccessApprovalStatus: boolean;
  powerProducerId: string;
  powerProducerName: string;
  active: boolean;

  constructor(
    id: string,
    name: string,
    ratedPower: number,
    technology: HydrogenProductionTechnology,
    producing: boolean,
    powerAccessApprovalStatus: boolean,
    powerProducerId: string,
    powerProducerName: string,
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.technology = technology;
    this.producing = producing;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
    this.powerProducerName = powerProducerName;
    this.active = active;
  }

  static fromEntity(unit: HydrogenProductionUnitEntity): HydrogenProductionOverviewDto {
    const firstApproval = unit.owner?.hydrogenApprovals?.[0];

    return {
      id: unit.id,
      name: unit.name,
      ratedPower: unit.ratedPower,
      technology: unit.technology,
      producing: true,
      powerAccessApprovalStatus: HydrogenProductionOverviewDto.existsPowerProducer(unit),
      powerProducerId: firstApproval?.powerProducer.id ?? '',
      powerProducerName: firstApproval?.powerProducer.name ?? '',
      active: unit.active,
    };
  }

  private static existsPowerProducer(unit: HydrogenProductionUnitEntity) {
    return unit.owner?.hydrogenApprovals?.length ? unit.owner.hydrogenApprovals.length !== 0 : false;
  }
}
