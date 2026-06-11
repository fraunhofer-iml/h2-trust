/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { BiddingZone, PowerProductionType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreatePowerProductionUnitPayload extends BaseCreateUnitPayload {
  @IsEnum(BiddingZone)
  @IsNotEmpty()
  biddingZone: BiddingZone;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ratedPower: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  decommissioningPlannedOn: Date;

  @IsBoolean()
  @IsNotEmpty()
  financialSupportReceived: boolean;

  @IsEnum(PowerProductionType)
  @IsNotEmpty()
  powerProductionType: PowerProductionType;

  constructor(
    name: string,
    commissionedOn: Date,
    address: AddressPayload,
    ownerId: string,
    ratedPower: number,
    biddingZone: BiddingZone,
    financialSupportReceived: boolean,
    powerProductionType: PowerProductionType,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    operatorId: string,
    decommissioningPlannedOn: Date,
    id?: string,
  ) {
    super(
      name,
      commissionedOn,
      address,
      ownerId,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      operatorId,
      id,
    );
    this.ratedPower = ratedPower;
    this.biddingZone = biddingZone;
    this.financialSupportReceived = financialSupportReceived;
    this.powerProductionType = powerProductionType;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
  }
}
