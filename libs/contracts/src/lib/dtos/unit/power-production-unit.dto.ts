/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  biddingZone: BiddingZone;
  ratedPower: number;
  decommissioningPlannedOn: Date;
  type: PowerProductionType;
  financialSupportReceived: boolean;

  override readonly unitType = UnitType.POWER_PRODUCTION;

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    ratedPower: number,
    type: PowerProductionType,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    biddingZone: BiddingZone,
    financialSupportReceived: boolean,
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
    this.ratedPower = ratedPower;
    this.type = type;
    this.biddingZone = biddingZone;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.financialSupportReceived = financialSupportReceived;
  }

  static override fromEntity(unit: UnitEntity): PowerProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      unitType: UnitType.POWER_PRODUCTION,
      biddingZone: unit.specification.biddingZone!,
      ratedPower: unit.specification.ratedPower ?? 0,
      decommissioningPlannedOn: unit.specification.decommissioningPlannedOn!,
      type: unit.specification.type as PowerProductionType,
      financialSupportReceived: unit.specification.financialSupportReceived ?? false,
    };
  }
}
