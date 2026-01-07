/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductionDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  productionStartedAt: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  productionEndedAt: Date;

  @IsString()
  @IsNotEmpty()
  powerProductionUnitId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  powerAmountKwh: number;

  @IsString()
  @IsNotEmpty()
  hydrogenProductionUnitId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  hydrogenAmountKg: number;

  @IsString()
  @IsNotEmpty()
  hydrogenStorageUnitId: string;

  constructor(
    productionStartedAt: Date,
    productionEndedAt: Date,
    powerProductionUnitId: string,
    powerAmountKwh: number,
    hydrogenProductionUnitId: string,
    hydrogenAmountKg: number,
    hydrogenStorageUnitId: string,
  ) {
    this.productionStartedAt = productionStartedAt;
    this.productionEndedAt = productionEndedAt;
    this.powerProductionUnitId = powerProductionUnitId;
    this.powerAmountKwh = powerAmountKwh;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.hydrogenAmountKg = hydrogenAmountKg;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
  }
}
