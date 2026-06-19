/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';

//TODO-LG: update swagger annotation
//TODO-LG: reduce DTO size and use the CreateQualityDetails dto here
export class CreateProcessStepDto {
  @IsEnum(ProcessType)
  @IsNotEmpty()
  processType: ProcessType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @ApiProperty({
    example: 1000,
    description: 'Amount of bottled hydrogen',
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'company-recipient-1',
    description: 'ID of the recipient company',
  })
  recipient: string;

  @IsNotEmpty()
  @IsISO8601()
  @ApiProperty({
    example: '2025-04-07T00:00:00.000Z',
    description: 'Timestamp of bottling (ISO-8601)',
  })
  filledAt: string;

  @IsString()
  @ApiProperty({
    example: 'user-id-1',
    description: 'ID of the user who recorded the process',
  })
  recordedBy: string;

  @IsString()
  @IsNotEmpty()
  executingUnitId: string;

  @IsString()
  @IsNotEmpty()
  predecessorUnitId: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Files to be uploaded',
  })
  files?: Express.Multer.File[];

  //quality details fields
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
