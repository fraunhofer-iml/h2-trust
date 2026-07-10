/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  method: HydrogenProductionType;
  technology: HydrogenProductionTechnology;
  biddingZone: BiddingZone;
  ratedPower: number;
  waterConsumptionLitersPerHour: number;

  override readonly unitType = UnitType.HYDROGEN_PRODUCTION;

  constructor(
    id: string,
    name: string,
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
    biddingZone: BiddingZone,
    method: HydrogenProductionType,
    technology: HydrogenProductionTechnology,
    waterConsumptionLitersPerHour: number,
    active: boolean,
  ) {
    super(
      id,
      name,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      modelNumber,
      owner,
      operator,
      active,
    );
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static override fromEntity(unit: UnitEntity): HydrogenProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      unitType: UnitType.HYDROGEN_PRODUCTION,
      method: unit.details.type as HydrogenProductionType,
      technology: unit.details.technology!,
      biddingZone: unit.details.biddingZone!,
      ratedPower: unit.details.ratedPower ?? 0,
      waterConsumptionLitersPerHour: unit.details.waterConsumptionLitersPerHour ?? 0,
    };
  }
}
