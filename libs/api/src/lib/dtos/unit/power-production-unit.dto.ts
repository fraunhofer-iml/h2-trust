/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { EnumLabelMapper } from '../../labels';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { PowerProductionTypeDto } from './power-production-type.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  electricityMeterNumber: string;
  gridOperator: string;
  gridConnectionNumber: string;
  gridLevel: string;
  biddingZone: string;
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
    gridLevel: string,
    gridConnectionNumber: string,
    type: PowerProductionTypeDto,
    unitType: UnitType,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: string,
    electricityMeterNumber: string,
    biddingZone: string,
    financialSupportReceived: boolean,
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
      gridLevel: EnumLabelMapper.getGridLevel(unit.gridLevel),
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
