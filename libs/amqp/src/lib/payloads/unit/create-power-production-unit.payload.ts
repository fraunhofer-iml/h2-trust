/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { BiddingZone, GridLevel, PowerProductionType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreatePowerProductionUnitPayload extends BaseCreateUnitPayload {
  @IsString()
  @IsNotEmpty()
  electricityMeterNumber: string;

  @IsString()
  @IsOptional()
  gridOperator?: string;

  @IsString()
  @IsOptional()
  gridConnectionNumber?: string;

  @IsEnum(GridLevel)
  @IsNotEmpty()
  gridLevel: GridLevel;

  @IsEnum(BiddingZone)
  @IsNotEmpty()
  biddingZone: BiddingZone;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ratedPower: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  decommissioningPlannedOn?: Date;

  @IsBoolean()
  @IsNotEmpty()
  financialSupportReceived: boolean;

  @IsEnum(PowerProductionType)
  @IsNotEmpty()
  powerProductionType: PowerProductionType; // TODO-MP: rename to type

  constructor(
    name: string,
    mastrNumber: string,
    commissionedOn: Date,
    address: AddressPayload,
    companyId: string,
    electricityMeterNumber: string,
    ratedPower: number,
    gridLevel: GridLevel,
    biddingZone: BiddingZone,
    financialSupportReceived: boolean,
    powerProductionType: PowerProductionType,
    manufacturer?: string,
    modelType?: string,
    modelNumber?: string,
    serialNumber?: string,
    certifiedBy?: string,
    operatorId?: string,
    decommissioningPlannedOn?: Date,
    gridOperator?: string,
    gridConnectionNumber?: string,
  ) {
    super(name, mastrNumber, commissionedOn, address, companyId, manufacturer, modelType, modelNumber, serialNumber, certifiedBy, operatorId);
    this.electricityMeterNumber = electricityMeterNumber;
    this.ratedPower = ratedPower;
    this.gridLevel = gridLevel;
    this.biddingZone = biddingZone;
    this.financialSupportReceived = financialSupportReceived;
    this.powerProductionType = powerProductionType;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.gridOperator = gridOperator;
    this.gridConnectionNumber = gridConnectionNumber;
  }
}
