/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitDbType } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenProductionUnitEntity extends BaseUnitEntity {
  ratedPower?: number;
  pressure?: number;
  method?: string;
  technology?: string;
  biddingZone?: string;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    commissionedOn: Date,
    address: AddressEntity,
    company: {
      id?: string;
      hydrogenApprovals?: {
        powerAccessApprovalStatus?: string;
        powerProducerId?: string;
        powerProducerName?: string;
      }[];
    } | null,
    operator: CompanyEntity,
    unitType: UnitType,
    ratedPower: number,
    pressure: number,
    method: string,
    technology: string,
    biddingZone: string,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      commissionedOn,
      address,
      company,
      operator,
      unitType,
    );
    this.method = method;
    this.technology = technology;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.biddingZone = biddingZone;
  }

  static override fromDatabase(unit: HydrogenProductionUnitDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      ratedPower: unit.hydrogenProductionUnit?.ratedPower?.toNumber() ?? 0,
      pressure: unit.hydrogenProductionUnit?.pressure?.toNumber() ?? 0,
      method: unit.hydrogenProductionUnit?.method,
      technology: unit.hydrogenProductionUnit?.technology,
      biddingZone: unit.hydrogenProductionUnit?.biddingZone,
      unitType: UnitType.HYDROGEN_PRODUCTION,
    };
  }
}
