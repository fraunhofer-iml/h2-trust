/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitType } from '../../enums';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { PowerProductionTypeDto } from './power-production-type.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  ratedPower: number;
  gridOperator: string;
  gridLevel: string;
  gridConnectionNumber: string;
  type: PowerProductionTypeDto;
  electricityMeterNumber: string;
  biddingZone: string;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string }[];
    },
    ratedPower: number,
    gridOperator: string,
    gridLevel: string,
    gridConnectionNumber: string,
    type: PowerProductionTypeDto,
    unitType: UnitType,
    modelNumber: string,
    owner: string,
    operator: string,
    electricityMeterNumber: string,
    biddingZone: string,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      commissionedOn,
      decommissioningPlannedOn,
      address,
      company,
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
  }
}
