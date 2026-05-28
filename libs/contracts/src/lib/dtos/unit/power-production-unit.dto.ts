/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/contracts/entities';
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
    unitType: UnitType,
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
      unitType,
      active,
    );
    this.ratedPower = ratedPower;
    this.type = type;
    this.biddingZone = biddingZone;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.financialSupportReceived = financialSupportReceived;
  }

  static override fromEntity(unit: PowerProductionUnitEntity): PowerProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      biddingZone: unit.biddingZone,
      ratedPower: unit.ratedPower,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      type: unit.type,
      financialSupportReceived: unit.financialSupportReceived,
    };
  }
}
