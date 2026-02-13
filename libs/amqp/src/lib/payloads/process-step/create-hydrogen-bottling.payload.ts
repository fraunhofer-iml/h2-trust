/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { HydrogenColor, RFNBOType } from '@h2-trust/domain';
import 'multer';

export class CreateHydrogenBottlingPayload {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  filledAt: Date;

  @IsString()
  @IsNotEmpty()
  recordedById: string;

  @IsString()
  @IsNotEmpty()
  hydrogenStorageUnitId: string;

  @IsEnum(HydrogenColor)
  @IsNotEmpty()
  color: HydrogenColor;

  @IsEnum(RFNBOType)
  @IsNotEmpty()
  rfnboReady: RFNBOType;

  @IsArray()
  @IsOptional()
  files?: Express.Multer.File[];

  constructor(
    amount: number,
    ownerId: string,
    filledAt: Date,
    recordedById: string,
    hydrogenStorageUnitId: string,
    color: HydrogenColor,
    rfnboReady: RFNBOType,
    files?: Express.Multer.File[],
  ) {
    this.amount = amount;
    this.ownerId = ownerId;
    this.filledAt = filledAt;
    this.recordedById = recordedById;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
    this.color = color;
    this.rfnboReady = rfnboReady;
    this.files = files;
  }
}
