/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenProductionUnitEntity extends BaseUnitEntity {
  ratedPower: number;
  type: HydrogenProductionType;
  technology: HydrogenProductionTechnology;
  biddingZone: BiddingZone;
  waterConsumptionLitersPerHour: number;

  constructor(
    id: string,
    name: string,
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
    type: HydrogenProductionType,
    technology: HydrogenProductionTechnology,
    biddingZone: BiddingZone,
    waterConsumptionLitersPerHour: number,
    active: boolean,
  ) {
    super(
      id,
      name,
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
    this.type = type;
    this.technology = technology;
    this.ratedPower = ratedPower;
    this.biddingZone = biddingZone;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static fromDeepDatabase(unit: UnitDeepDbType): HydrogenProductionUnitEntity {
    assertDefined(unit.specification, 'hydrogenProductionUnit');
    assertValidEnum(unit.specification.type, HydrogenProductionType, 'HydrogenProductionType');
    assertValidEnum(unit.specification.technology, HydrogenProductionTechnology, 'HydrogenProductionTechnology');
    assertValidEnum(unit.specification.biddingZone, BiddingZone, 'BiddingZone');

    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(unit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: unit.specification?.ratedPower?.toNumber(),
      type: unit.specification.type,
      technology: unit.specification.technology,
      biddingZone: unit.specification.biddingZone,
      waterConsumptionLitersPerHour: unit.specification?.waterConsumptionLitersPerHour?.toNumber(),
    };
  }

  static fromNestedDatabase(baseUnit: UnitNestedDbType): HydrogenProductionUnitEntity {
    assertDefined(baseUnit.specification, 'hydrogenProductionUnit');
    assertValidEnum(baseUnit.specification.type, HydrogenProductionType, 'HydrogenProductionType');
    assertValidEnum(baseUnit.specification.technology, HydrogenProductionTechnology, 'HydrogenProductionTechnology');
    assertValidEnum(baseUnit.specification.biddingZone, BiddingZone, 'BiddingZone');

    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_PRODUCTION,

      ratedPower: baseUnit.specification?.ratedPower?.toNumber(),
      type: baseUnit.specification.type,
      technology: baseUnit.specification.technology,
      biddingZone: baseUnit.specification.biddingZone,
      waterConsumptionLitersPerHour: baseUnit.specification?.waterConsumptionLitersPerHour?.toNumber(),
    };
  }
}
