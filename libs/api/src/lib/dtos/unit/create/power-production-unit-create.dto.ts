/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { AddressPayload, CreatePowerProductionUnitPayload } from '@h2-trust/amqp';
import { BiddingZone, GridLevel, PowerProductionType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class PowerProductionUnitCreateDto extends UnitCreateDto {
  @IsNotEmpty()
  @IsEnum(PowerProductionType)
  powerProductionType: PowerProductionType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  decommissioningPlannedOn?: Date;

  @IsNotEmpty()
  @IsEnum(BiddingZone)
  biddingZone: BiddingZone;

  @IsOptional()
  @IsString()
  gridOperator?: string;

  @IsNotEmpty()
  @IsEnum(GridLevel)
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

  @IsNotEmpty()
  @IsBoolean()
  financialSupportReceived: boolean;

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
    commissionedOn: Date,
    address: AddressDto,
    powerProductionType: PowerProductionType,
    biddingZone: BiddingZone,
    gridLevel: GridLevel,
    ratedPower: number,
    electricityMeterNumber: string,
    financialSupportReceived: boolean,
    gridOperator?: string,
    gridConnectionNumber?: string,
    decommissioningPlannedOn?: Date,
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
    this.financialSupportReceived = financialSupportReceived;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
  }

  static toPayload(dto: PowerProductionUnitCreateDto): CreatePowerProductionUnitPayload {
    return CreatePowerProductionUnitPayload.of(
      dto.name,
      dto.mastrNumber,
      dto.commissionedOn,
      new AddressPayload(
        dto.address.street,
        dto.address.postalCode,
        dto.address.city,
        dto.address.state,
        dto.address.country,
      ),
      dto.owner,
      dto.electricityMeterNumber,
      dto.ratedPower,
      dto.gridLevel,
      dto.biddingZone,
      dto.financialSupportReceived,
      dto.powerProductionType,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
      dto.decommissioningPlannedOn,
      dto.gridOperator,
      dto.gridConnectionNumber,
    );
  }
}
