/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { PowerType, RfnboType } from '@h2-trust/domain';

export class CreateQualityDetailsDto {
  @IsNotEmpty()
  @IsEnum(RfnboType)
  rfnboType: RfnboType;

  @IsEnum(PowerType)
  @IsNotEmpty()
  productionPowerType: PowerType;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  usedRenewablePower?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  usedGridPower?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  distance?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  wasteWater?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  resinConsumption?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  compressedAir?: number;

  @IsNumber()
  @IsPositive()
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
