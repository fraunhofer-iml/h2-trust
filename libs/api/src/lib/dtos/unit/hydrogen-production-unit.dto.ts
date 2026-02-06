/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { EnumLabelMapper } from '../../labels';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  method: string;
  technology: string;
  biddingZone: string;
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
    operator: string,
    unitType: UnitType,
    biddingZone: string,
    pressure: number,
    method: string,
    technology: string,
    waterConsumptionLitersPerHour: number,
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
      method: EnumLabelMapper.getHydrogenProductionMethod(unit.method),
      technology: EnumLabelMapper.getHydrogenProductionTechnology(unit.technology),
      biddingZone: unit.biddingZone,
      ratedPower: unit.ratedPower,
      pressure: unit.pressure,
      waterConsumptionLitersPerHour: unit.waterConsumptionLitersPerHour,
    };
  }
}
