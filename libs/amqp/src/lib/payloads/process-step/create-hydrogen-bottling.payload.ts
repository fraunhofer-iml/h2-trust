/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { HydrogenColor } from '@h2-trust/domain';

export class CreateHydrogenBottlingPayload {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  filledAt!: Date;

  @IsString()
  @IsNotEmpty()
  recordedById!: string;

  @IsString()
  @IsNotEmpty()
  hydrogenStorageUnitId!: string;

  @IsString()
  @IsNotEmpty()
  color!: HydrogenColor;

  @IsString()
  @IsOptional()
  fileDescription?: string;

  @IsArray()
  @IsOptional()
  files?: Express.Multer.File[];

  static of(
    amount: number,
    ownerId: string,
    filledAt: Date,
    recordedById: string,
    hydrogenStorageUnitId: string,
    color: HydrogenColor,
    fileDescription?: string,
    files?: Express.Multer.File[],
  ): CreateHydrogenBottlingPayload {
    return {
      amount,
      ownerId,
      filledAt,
      recordedById,
      hydrogenStorageUnitId,
      color,
      fileDescription,
      files,
    };
  }
}
