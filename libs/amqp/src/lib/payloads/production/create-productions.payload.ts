/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductionsPayload {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  productionStartedAt!: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  productionEndedAt!: Date;

  @IsString()
  @IsNotEmpty()
  powerProductionUnitId!: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  powerAmountKwh!: number;

  @IsString()
  @IsNotEmpty()
  hydrogenProductionUnitId!: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  hydrogenAmountKg!: number;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  hydrogenStorageUnitId!: string;

  static of(
    productionStartedAt: Date,
    productionEndedAt: Date,
    powerProductionUnitId: string,
    powerAmountKwh: number,
    hydrogenProductionUnitId: string,
    hydrogenAmountKg: number,
    userId: string,
    hydrogenStorageUnitId: string,
  ): CreateProductionsPayload {
    return {
      productionStartedAt,
      productionEndedAt,
      powerProductionUnitId,
      powerAmountKwh,
      hydrogenProductionUnitId,
      hydrogenAmountKg,
      userId,
      hydrogenStorageUnitId,
    };
  }
}
