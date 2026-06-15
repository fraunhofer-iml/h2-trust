/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';

//TODO-LG: reduce DTO size and use the CreateQualityDetails dto here
export class CreateProcessStepDto {
  @IsEnum(ProcessType)
  @IsNotEmpty()
  processType: ProcessType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  recipient: string;

  @IsNotEmpty()
  @IsISO8601()
  filledAt: string;

  @IsString()
  recordedBy: string;

  @IsString()
  @IsNotEmpty()
  executingUnitId: string;

  @IsString()
  @IsNotEmpty()
  predecessorUnitId: string;

  @IsArray()
  @IsOptional()
  files?: Express.Multer.File[];

  //quality details fields
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
    processType: ProcessType,
    amount: number,
    recipient: string,
    filledAt: string,
    recordedBy: string,
    executingUnitId: string,
    predecessorUnitId: string,
    rfnboType: RfnboType,
    productionPowerType: PowerType,
    usedRenewablePower: number,
    usedGridPower: number,
    distance: number,
    wasteWater: number,
    resinConsumption: number,
    compressedAir: number,
    nitrogenConsumption: number,
    files?: Express.Multer.File[],
  ) {
    this.processType = processType;
    this.amount = amount;
    this.recipient = recipient;
    this.filledAt = filledAt;
    this.recordedBy = recordedBy;
    this.executingUnitId = executingUnitId;
    this.predecessorUnitId = predecessorUnitId;
    this.files = files;
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
