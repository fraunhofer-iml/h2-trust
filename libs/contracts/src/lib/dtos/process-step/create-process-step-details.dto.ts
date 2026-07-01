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
  @ApiProperty({
    enum: PowerType,
    example: 'RENEWABLE',
    description: 'The type of the power production that is used for this process step',
  })
  productionPowerType: PowerType;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'The amount of used renewable power',
  })
  usedRenewablePower?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'The amount of used grid power',
  })
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
  @ApiProperty({
    example: 1000,
    description: 'The amount of used waste water',
  })
  wasteWater?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'The amount of used resin',
  })
  resinConsumption?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'The amount of used compressed air',
  })
  compressedAir?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'The amount of used nitrogen',
  })
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
