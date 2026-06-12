/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { PowerType, RfnboType } from '@h2-trust/domain';
import 'multer';

export class CreateProcessStepQualityPayload {
  @IsEnum(RfnboType)
  @IsNotEmpty()
  rfnboType: RfnboType;

  @IsEnum(PowerType)
  @IsNotEmpty()
  productionPowerType: PowerType;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  usedRenewablePower?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  usedGridPower?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  distance?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  wasteWater?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  resinConsumption?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  compressedAir?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
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
