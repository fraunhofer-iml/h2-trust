/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionUnitDbType,
  HydrogenProductionUnitRefDeepDbType,
  HydrogenProductionUnitRefShallowDbType,
} from '@h2-trust/database';
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
  /*
  static fromSurfaceDatabaseAsRef(unit: HydrogenProductionUnitRefSurfaceDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      id: unit.generalInfo.id,
      name: unit.generalInfo?.name,
      mastrNumber: unit.generalInfo?.mastrNumber,
      manufacturer: unit.generalInfo?.manufacturer,
      modelNumber: unit.generalInfo?.modelNumber,
      serialNumber: unit.generalInfo?.serialNumber,
      certifiedBy: unit.generalInfo?.certifiedBy,
      commissionedOn: unit.generalInfo?.commissionedOn,
      owner: CompanyEntity.fromBaseDatabase(unit.generalInfo.owner),
      operator: CompanyEntity.fromBaseDatabase(unit.generalInfo?.operator),
      unitType: UnitType.HYDROGEN_PRODUCTION,
      ratedPower: unit.ratedPower.toNumber(),
      pressure: unit.pressure.toNumber(),
      method: unit.method,
      technology: unit.technology,
      biddingZone: unit.biddingZone,
      waterConsumptionLitersPerHour: unit.waterConsumptionLitersPerHour.toNumber(),
    };
  }*/

  static fromShallowDatabaseAsRef(unit: HydrogenProductionUnitRefShallowDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      id: unit.generalInfo.id,
      name: unit.generalInfo?.name,
      mastrNumber: unit.generalInfo?.mastrNumber,
      manufacturer: unit.generalInfo?.manufacturer,
      modelNumber: unit.generalInfo?.modelNumber,
      serialNumber: unit.generalInfo?.serialNumber,
      certifiedBy: unit.generalInfo?.certifiedBy,
      commissionedOn: unit.generalInfo?.commissionedOn,
      owner: CompanyEntity.fromBaseDatabase(unit.generalInfo.owner),
      operator: CompanyEntity.fromBaseDatabase(unit.generalInfo?.operator),
      unitType: UnitType.HYDROGEN_PRODUCTION,
      ratedPower: unit.ratedPower.toNumber(),
      pressure: unit.pressure.toNumber(),
      method: unit.method,
      technology: unit.technology,
      biddingZone: unit.biddingZone,
      waterConsumptionLitersPerHour: unit.waterConsumptionLitersPerHour.toNumber(),
    };
  }

  static fromDeepDatabaseAsRef(unit: HydrogenProductionUnitRefDeepDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      id: unit.generalInfo.id,
      name: unit.generalInfo?.name,
      mastrNumber: unit.generalInfo?.mastrNumber,
      manufacturer: unit.generalInfo?.manufacturer,
      modelNumber: unit.generalInfo?.modelNumber,
      serialNumber: unit.generalInfo?.serialNumber,
      certifiedBy: unit.generalInfo?.certifiedBy,
      commissionedOn: unit.generalInfo?.commissionedOn,
      owner: CompanyEntity.fromShallowDatabase(unit.generalInfo.owner),
      operator: CompanyEntity.fromShallowDatabase(unit.generalInfo?.operator),
      unitType: UnitType.HYDROGEN_PRODUCTION,
      ratedPower: unit.ratedPower.toNumber(),
      pressure: unit.pressure.toNumber(),
      method: unit.method,
      technology: unit.technology,
      biddingZone: unit.biddingZone,
      waterConsumptionLitersPerHour: unit.waterConsumptionLitersPerHour.toNumber(),
    };
  }

  static override fromDeepDatabase(unit: HydrogenProductionUnitDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepDatabase(unit),
      ratedPower: unit.hydrogenProductionUnit?.ratedPower.toNumber(),
      pressure: unit.hydrogenProductionUnit?.pressure.toNumber(),
      method: unit.hydrogenProductionUnit?.method,
      technology: unit.hydrogenProductionUnit?.technology,
      biddingZone: unit.hydrogenProductionUnit?.biddingZone,
      unitType: UnitType.HYDROGEN_PRODUCTION,
      waterConsumptionLitersPerHour: unit.hydrogenProductionUnit?.waterConsumptionLitersPerHour.toNumber(),
    };
  }
}
