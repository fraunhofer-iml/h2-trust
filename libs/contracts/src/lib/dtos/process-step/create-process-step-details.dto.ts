/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PowerType, RfnboType } from '@h2-trust/domain';

//TODO-LG: update swagger annotation
export class CreateProcessStepDetailsDto {
  @IsNotEmpty()
  @IsEnum(RfnboType)
  @ApiProperty({
    enum: RfnboType,
    example: 'RFNBO_READY',
    description: 'RFNBO type',
  })
  rfnboType: RfnboType;

  @IsEnum(PowerType)
  @IsNotEmpty()
  productionPowerType: PowerType;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  usedRenewablePower?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  usedGridPower?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'Transport distance in km (only relevant for TRAILER)',
  })
  distance?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  wasteWater?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  resinConsumption?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  compressedAir?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  nitrogenConsumption?: number;

  constructor(
    rfnboType: RfnboType,
    productionPowerType: PowerType,
    usedRenewablePower: number,
    usedGridPower: number,
    distance: number,
    wasteWater: number,
    resinConsumption: number,
    compressedAir: number,
    nitrogenConsumption: number,
  ) {
    this.rfnboType = rfnboType;
    this.productionPowerType = productionPowerType;
    this.usedRenewablePower = usedRenewablePower;
    this.usedGridPower = usedGridPower;
    this.distance = distance;
    this.wasteWater = wasteWater;
    this.resinConsumption = resinConsumption;
    this.compressedAir = compressedAir;
    this.nitrogenConsumption = nitrogenConsumption;
  }
}
