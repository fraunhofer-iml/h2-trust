/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
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
    active: boolean,
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
      active,
    );
    this.method = method;
    this.technology = technology;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.biddingZone = biddingZone;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static fromDeepDatabase(baseUnit: UnitDeepDbType): HydrogenProductionUnitEntity {
    assertDefined(baseUnit.hydrogenProductionUnit, 'hydrogenProductionUnit');
    assertValidEnum(baseUnit.hydrogenProductionUnit.method, HydrogenProductionMethod, 'HydrogenProductionMethod');
    assertValidEnum(
      baseUnit.hydrogenProductionUnit.technology,
      HydrogenProductionTechnology,
      'HydrogenProductionTechnology',
    );
    assertValidEnum(baseUnit.hydrogenProductionUnit.biddingZone, BiddingZone, 'BiddingZone');

    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: baseUnit.hydrogenProductionUnit.ratedPower.toNumber(),
      pressure: baseUnit.hydrogenProductionUnit.pressure.toNumber(),
      method: baseUnit.hydrogenProductionUnit.method,
      technology: baseUnit.hydrogenProductionUnit.technology,
      biddingZone: baseUnit.hydrogenProductionUnit.biddingZone,
      waterConsumptionLitersPerHour: baseUnit.hydrogenProductionUnit.waterConsumptionLitersPerHour.toNumber(),
    };
  }

  static fromNestedDatabase(baseUnit: UnitNestedDbType): HydrogenProductionUnitEntity {
    assertDefined(baseUnit.hydrogenProductionUnit, 'hydrogenProductionUnit');
    assertValidEnum(baseUnit.hydrogenProductionUnit.method, HydrogenProductionMethod, 'HydrogenProductionMethod');
    assertValidEnum(
      baseUnit.hydrogenProductionUnit.technology,
      HydrogenProductionTechnology,
      'HydrogenProductionTechnology',
    );
    assertValidEnum(baseUnit.hydrogenProductionUnit.biddingZone, BiddingZone, 'BiddingZone');

    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: baseUnit.hydrogenProductionUnit.ratedPower.toNumber(),
      pressure: baseUnit.hydrogenProductionUnit.pressure.toNumber(),
      method: baseUnit.hydrogenProductionUnit.method,
      technology: baseUnit.hydrogenProductionUnit.technology,
      biddingZone: baseUnit.hydrogenProductionUnit.biddingZone,
      waterConsumptionLitersPerHour: baseUnit.hydrogenProductionUnit.waterConsumptionLitersPerHour.toNumber(),
    };
  }
}
