/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/contracts';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  method: HydrogenProductionMethod;
  technology: HydrogenProductionTechnology;
  biddingZone: BiddingZone;
  ratedPower: number;
  pressure: number;
  waterConsumptionLitersPerHour: number;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    ratedPower: number,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    unitType: UnitType,
    biddingZone: BiddingZone,
    pressure: number,
    method: HydrogenProductionMethod,
    technology: HydrogenProductionTechnology,
    waterConsumptionLitersPerHour: number,
    active: boolean,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      modelNumber,
      owner,
      operator,
      unitType,
      active,
    );
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static override fromEntity(unit: HydrogenProductionUnitEntity): HydrogenProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      method: unit.method,
      technology: unit.technology,
      biddingZone: unit.biddingZone,
      ratedPower: unit.ratedPower,
      pressure: unit.pressure,
      waterConsumptionLitersPerHour: unit.waterConsumptionLitersPerHour,
    };
  }
}
