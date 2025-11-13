/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';
import { requireDefined } from '@h2-trust/utils';
import { EnumLabelMapper } from '../../labels';

export class HydrogenProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  technology: string;
  producing: boolean;
  powerAccessApprovalStatus: boolean;
  powerProducerId: string;
  powerProducerName: string;

  constructor(
    id: string,
    name: string,
    ratedPower: number,
    technology: string,
    producing: boolean,
    powerAccessApprovalStatus: boolean,
    powerProducerId: string,
    powerProducerName: string,
  ) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.technology = technology;
    this.producing = producing;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
    this.powerProducerName = powerProducerName;
  }

  static fromEntity(unit: HydrogenProductionUnitEntity): HydrogenProductionOverviewDto {
    const firstApproval = unit.company?.hydrogenApprovals?.[0];

    return <HydrogenProductionOverviewDto>{
      id: unit.id,
      name: unit.name,
      ratedPower: unit.ratedPower,
      technology: EnumLabelMapper.getHydrogenProductionTechnology(requireDefined(unit.technology, 'unit.technology')),
      producing: true,
      powerAccessApprovalStatus: HydrogenProductionOverviewDto.existsPowerProducer(unit),
      powerProducerId: firstApproval?.powerProducerId ?? '',
      powerProducerName: firstApproval?.powerProducerName ?? '',
    };
  }

  private static existsPowerProducer(unit: HydrogenProductionUnitEntity) {
    return unit.company?.hydrogenApprovals?.length ? unit.company.hydrogenApprovals.length !== 0 : false;
  }
}
