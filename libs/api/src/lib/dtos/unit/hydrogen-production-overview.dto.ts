/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';

export class HydrogenProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  typeName: string | undefined;
  producing: boolean;
  powerAccessApprovalStatus: boolean;
  powerProducerId: string;
  powerProducerName: string;
  hydrogenStorageUnit:
    | {
        id?: string;
        name?: string;
      }
    | undefined;

  constructor(
    id: string,
    name: string,
    ratedPower: number,
    typeName: string,
    producing: boolean,
    powerAccessApprovalStatus: boolean,
    powerProducerId: string,
    powerProducerName: string,
    hydrogenStorageUnit: {
      id: string;
      name: string;
    },
  ) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.producing = producing;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
    this.powerProducerName = powerProducerName;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
  }

  static fromEntity(unit: HydrogenProductionUnitEntity): HydrogenProductionOverviewDto {
    const firstApproval = unit.company?.hydrogenApprovals?.[0];

    return <HydrogenProductionOverviewDto>{
      id: unit.id,
      name: unit.name,
      ratedPower: unit.ratedPower,
      typeName: unit.type?.technology,
      producing: true,
      powerAccessApprovalStatus: HydrogenProductionOverviewDto.existsPowerProducer(unit),
      powerProducerId: firstApproval?.powerProducerId ?? '',
      powerProducerName: firstApproval?.powerProducerName ?? '',
      hydrogenStorageUnit: unit.hydrogenStorageUnit,
    };
  }

  private static existsPowerProducer(unit: HydrogenProductionUnitEntity) {
    return unit.company?.hydrogenApprovals?.length ? unit.company.hydrogenApprovals.length !== 0 : false;
  }
}
