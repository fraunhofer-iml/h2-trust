/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { BiddingZones, GridLevel, PowerProductionType, UnitType } from '../../../enums';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class PowerProductionUnitCreateDto extends UnitCreateDto {
  @IsNotEmpty()
  @IsIn([Object.values(PowerProductionType)])
  powerProductionType: PowerProductionType;

  @IsOptional()
  @IsISO8601()
  decommissioningPlannedOn?: string;

  @IsNotEmpty()
  @IsIn([Object.values(BiddingZones)])
  biddingZone: BiddingZones;

  @IsOptional()
  @IsString()
  gridOperator?: string;

  @IsNotEmpty()
  @IsIn([Object.values(BiddingZones)])
  gridLevel: GridLevel;

  @IsOptional()
  @IsString()
  gridConnectionNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  ratedPower: number;

  @IsNotEmpty()
  @IsString()
  electricityMeterNumber: string;

  constructor(
    type: UnitType,
    name: string,
    owner: string,
    operator: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    mastrNumber: string,
    certifiedBy: string,
    commissionedOn: string,
    address: AddressDto,
    powerProductionType: PowerProductionType,
    biddingZone: BiddingZones,
    gridLevel: GridLevel,
    ratedPower: number,
    electricityMeterNumber: string,
    gridOperator?: string,
    gridConnectionNumber?: string,
  ) {
    super(
      type,
      name,
      owner,
      operator,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      mastrNumber,
      certifiedBy,
      commissionedOn,
      address,
    );
    this.powerProductionType = powerProductionType;
    this.biddingZone = biddingZone;
    this.gridLevel = gridLevel;
    this.ratedPower = ratedPower;
    this.electricityMeterNumber = electricityMeterNumber;
    this.gridOperator = gridOperator;
    this.gridConnectionNumber = gridConnectionNumber;
  }
}
