/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDeepDbType, BaseUnitNestedDbType } from '@h2-trust/database';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenProductionUnitEntity extends BaseUnitEntity {
  ratedPower: number;
  pressure: number;
  method: HydrogenProductionMethod;
  technology: HydrogenProductionTechnology;
  biddingZone: BiddingZone;
  waterConsumptionLitersPerHour: number;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressEntity,
    owner: CompanyEntity,
    operator: CompanyEntity,
    unitType: UnitType,
    ratedPower: number,
    pressure: number,
    method: HydrogenProductionMethod,
    technology: HydrogenProductionTechnology,
    biddingZone: BiddingZone,
    waterConsumptionLitersPerHour: number,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      owner,
      operator,
      unitType,
    );
    this.method = method;
    this.technology = technology;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.biddingZone = biddingZone;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  //TODO-LG: combine the fromDatabase functions
  static fromDeepDatabase(baseUnit: BaseUnitDeepDbType): HydrogenProductionUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a Hydrogen Production Object
    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: baseUnit.hydrogenProductionUnit?.ratedPower.toNumber(),
      pressure: baseUnit.hydrogenProductionUnit?.pressure.toNumber(),
      method: baseUnit.hydrogenProductionUnit?.method,
      technology: baseUnit.hydrogenProductionUnit?.technology,
      biddingZone: baseUnit.hydrogenProductionUnit?.biddingZone,
      waterConsumptionLitersPerHour: baseUnit.hydrogenProductionUnit?.waterConsumptionLitersPerHour.toNumber(),
    };
  }

  static fromNestedDatabase(baseUnit: BaseUnitNestedDbType): HydrogenProductionUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a Hydrogen Production Object

    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: baseUnit.hydrogenProductionUnit?.ratedPower.toNumber(),
      pressure: baseUnit.hydrogenProductionUnit?.pressure.toNumber(),
      method: baseUnit.hydrogenProductionUnit?.method,
      technology: baseUnit.hydrogenProductionUnit?.technology,
      biddingZone: baseUnit.hydrogenProductionUnit?.biddingZone,
      waterConsumptionLitersPerHour: baseUnit.hydrogenProductionUnit?.waterConsumptionLitersPerHour.toNumber(),
    };
  }
}
