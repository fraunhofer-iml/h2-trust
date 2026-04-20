/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/contracts';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { PowerProductionTypeDto } from './power-production-type.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  electricityMeterNumber: string;
  gridOperator: string;
  gridConnectionNumber: string;
  gridLevel: GridLevel;
  biddingZone: BiddingZone;
  ratedPower: number;
  decommissioningPlannedOn: Date;
  type: PowerProductionTypeDto;
  financialSupportReceived: boolean;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    ratedPower: number,
    gridOperator: string,
    gridLevel: GridLevel,
    gridConnectionNumber: string,
    type: PowerProductionTypeDto,
    unitType: UnitType,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    electricityMeterNumber: string,
    biddingZone: BiddingZone,
    financialSupportReceived: boolean,
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
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.gridConnectionNumber = gridConnectionNumber;
    this.type = type;
    this.electricityMeterNumber = electricityMeterNumber;
    this.biddingZone = biddingZone;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.financialSupportReceived = financialSupportReceived;
  }

  static override fromEntity(unit: PowerProductionUnitEntity): PowerProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      electricityMeterNumber: unit.electricityMeterNumber,
      gridOperator: unit.gridOperator,
      gridConnectionNumber: unit.gridConnectionNumber,
      gridLevel: unit.gridLevel,
      biddingZone: unit.biddingZone,
      ratedPower: unit.ratedPower,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      type: {
        name: unit.type.name,
        energySource: unit.type.energySource,
        hydrogenColor: unit.type.hydrogenColor,
      },
      financialSupportReceived: unit.financialSupportReceived,
    };
  }
}
